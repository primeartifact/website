-- PrimeArtifact Secure Clipboard schema
-- Bindings expected in Cloudflare Pages:
--   D1: CLIPBOARD_DB
--   KV: CLIPBOARD
-- Optional:
--   Secret: TURNSTILE_SECRET_KEY

CREATE TABLE IF NOT EXISTS clips (
  id TEXT PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  ciphertext_key TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  max_reads INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  burn_after_read INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  last_read_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_clips_status_expires ON clips(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_clips_short_code ON clips(short_code);

CREATE TABLE IF NOT EXISTS clip_rate_limits (
  bucket_key TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(bucket_key, action)
);

CREATE INDEX IF NOT EXISTS idx_clip_rate_limits_updated_at ON clip_rate_limits(updated_at);
