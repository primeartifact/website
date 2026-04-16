const TTL_MAP = {
  '1h': 3600,
  '24h': 86400,
  '7d': 604800
};

const MAX_PLAINTEXT_BYTES = 65536;
const MAX_CIPHERTEXT_BYTES = 140000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

export function ok(data, status = 200) {
  return json({ ok: true, ...data }, status);
}

export function fail(code, message, status) {
  return json({ ok: false, error: { code, message } }, status);
}

export function getBindings(env) {
  if (!env || !env.CLIPBOARD_DB || !env.CLIPBOARD) {
    throw new Error('Missing CLIPBOARD_DB or CLIPBOARD binding.');
  }
  return {
    db: env.CLIPBOARD_DB,
    kv: env.CLIPBOARD
  };
}

export async function parseJson(request) {
  try {
    return await request.json();
  } catch (err) {
    return null;
  }
}

export function normalizeCode(input) {
  const compact = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return compact.length > 3 ? `${compact.slice(0, 3)}-${compact.slice(3)}` : compact;
}

export function ttlToSeconds(ttl) {
  return TTL_MAP[ttl] || 0;
}

export function nowEpochSeconds() {
  return Math.floor(Date.now() / 1000);
}

function bytesToBase64url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function randomId(size = 16) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytesToBase64url(bytes);
}

export function createShortCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < bytes.length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    if (i === 2) code += '-';
  }
  return code;
}

export function validateEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    return 'Missing encrypted payload.';
  }
  if (envelope.v !== 1) {
    return 'Unsupported clip version.';
  }
  if (envelope.alg !== 'AES-GCM-256/HKDF-SHA-256') {
    return 'Unsupported encryption algorithm.';
  }
  if (typeof envelope.salt !== 'string' || typeof envelope.iv !== 'string' || typeof envelope.ciphertext !== 'string') {
    return 'Encrypted payload is incomplete.';
  }
  if (!Number.isInteger(envelope.plainTextBytes) || envelope.plainTextBytes <= 0) {
    return 'Invalid plaintext size metadata.';
  }
  if (envelope.plainTextBytes > MAX_PLAINTEXT_BYTES) {
    return 'Payload exceeds the 64 KB clipboard limit.';
  }
  if (envelope.ciphertext.length > MAX_CIPHERTEXT_BYTES) {
    return 'Encrypted payload exceeds the server limit.';
  }
  return '';
}

export function mapClipRow(row) {
  return {
    id: row.id,
    shortCode: row.short_code,
    expiresAt: new Date(row.expires_at * 1000).toISOString(),
    createdAt: new Date(row.created_at * 1000).toISOString(),
    readCount: row.read_count,
    maxReads: row.max_reads,
    burnAfterRead: !!row.burn_after_read,
    status: row.status
  };
}

async function sha256(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = new Uint8Array(digest);
  let out = '';
  for (let i = 0; i < hash.length; i++) {
    out += hash[i].toString(16).padStart(2, '0');
  }
  return out;
}

async function getRateKey(request, action) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown-ip';
  const userAgent = request.headers.get('User-Agent') || 'unknown-ua';
  return sha256(`${action}:${ip}:${userAgent}`);
}

export async function enforceRateLimit(db, request, action, limit, windowSeconds) {
  const key = await getRateKey(request, action);
  const now = nowEpochSeconds();
  const resetBefore = now - windowSeconds;

  await db.prepare(
    `INSERT INTO clip_rate_limits (bucket_key, action, window_start, count, updated_at)
     VALUES (?, ?, ?, 1, ?)
     ON CONFLICT(bucket_key, action) DO UPDATE SET
       count = CASE WHEN clip_rate_limits.window_start <= ? THEN 1 ELSE clip_rate_limits.count + 1 END,
       window_start = CASE WHEN clip_rate_limits.window_start <= ? THEN excluded.window_start ELSE clip_rate_limits.window_start END,
       updated_at = excluded.updated_at`
  ).bind(key, action, now, now, resetBefore, resetBefore).run();

  const result = await db.prepare(
    'SELECT count, window_start FROM clip_rate_limits WHERE bucket_key = ? AND action = ?'
  ).bind(key, action).first();

  if (!result) return;

  if (result.window_start > resetBefore && result.count > limit) {
    throw Object.assign(new Error('Too many requests. Please wait a moment and try again.'), {
      code: 'RATE_LIMITED',
      status: 429
    });
  }
}

export async function maybeVerifyTurnstile(env, request, token) {
  if (!env.TURNSTILE_SECRET_KEY) return;
  const requireToken = env.CLIPBOARD_TURNSTILE_REQUIRED === 'true';
  if (!token && !requireToken) return;
  if (!token) {
    throw Object.assign(new Error('Human verification is required for this request.'), {
      code: 'TURNSTILE_REQUIRED',
      status: 403
    });
  }

  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) formData.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  });
  const result = await response.json();
  if (!result.success) {
    throw Object.assign(new Error('Verification failed. Please try again.'), {
      code: 'TURNSTILE_FAILED',
      status: 403
    });
  }
}

export async function loadClipById(db, id) {
  return db.prepare('SELECT * FROM clips WHERE id = ? LIMIT 1').bind(id).first();
}

export async function loadClipByCode(db, shortCode) {
  return db.prepare('SELECT * FROM clips WHERE short_code = ? LIMIT 1').bind(shortCode).first();
}

export function isExpired(row) {
  return !row || row.expires_at <= nowEpochSeconds();
}
