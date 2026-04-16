import {
  fail,
  getBindings,
  ok,
  parseJson,
  ttlToSeconds,
  validateEnvelope,
  randomId,
  createShortCode,
  mapClipRow,
  enforceRateLimit,
  maybeVerifyTurnstile,
  nowEpochSeconds
} from './_clip-utils.js';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { db, kv } = getBindings(env);
    await enforceRateLimit(db, request, 'create', 20, 3600);

    const body = await parseJson(request);
    if (!body) {
      return fail('INVALID_JSON', 'Send a valid JSON payload.', 400);
    }

    const envelopeError = validateEnvelope(body.envelope);
    if (envelopeError) {
      return fail(
        envelopeError.includes('64 KB') ? 'PAYLOAD_TOO_LARGE' : 'INVALID_PAYLOAD',
        envelopeError,
        envelopeError.includes('64 KB') ? 413 : 400
      );
    }

    const ttlSeconds = ttlToSeconds(body.ttl);
    if (!ttlSeconds) {
      return fail('INVALID_TTL', 'Choose 1 hour, 24 hours, or 7 days.', 400);
    }

    await maybeVerifyTurnstile(env, request, body.turnstileToken);

    const now = nowEpochSeconds();
    const expiresAt = now + ttlSeconds;
    const burnAfterRead = !!body.burnAfterRead;
    const maxReads = burnAfterRead ? 1 : 0;

    let row = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const clipId = randomId(18);
      const shortCode = createShortCode();
      const ciphertextKey = `clip:${clipId}`;
      try {
        await kv.put(ciphertextKey, JSON.stringify(body.envelope), { expirationTtl: ttlSeconds });
        const result = await db.prepare(
          `INSERT INTO clips (
            id, short_code, ciphertext_key, expires_at, created_at,
            max_reads, read_count, burn_after_read, status, last_read_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'active', NULL)`
        ).bind(
          clipId,
          shortCode,
          ciphertextKey,
          expiresAt,
          now,
          maxReads,
          burnAfterRead ? 1 : 0
        ).run();

        if (result.success) {
          row = await db.prepare('SELECT * FROM clips WHERE id = ?').bind(clipId).first();
          break;
        }
      } catch (err) {
        await kv.delete(ciphertextKey);
        if (String(err && err.message || '').includes('UNIQUE')) {
          continue;
        }
        throw err;
      }
    }

    if (!row) {
      return fail('CREATE_FAILED', 'Unable to reserve a secure short code right now.', 503);
    }

    return ok({ clip: mapClipRow(row) }, 201);
  } catch (err) {
    if (err.code && err.status) {
      return fail(err.code, err.message, err.status);
    }
    return fail('INTERNAL_ERROR', 'Unable to create the secure clip right now.', 500);
  }
}

export async function onRequestGet() {
  return fail('METHOD_NOT_ALLOWED', 'Use POST to create a clip.', 405);
}
