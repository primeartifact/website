import {
  fail,
  getBindings,
  ok,
  parseJson,
  loadClipById,
  mapClipRow,
  isExpired,
  enforceRateLimit,
  nowEpochSeconds
} from '../_clip-utils.js';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { db, kv } = getBindings(env);
    await enforceRateLimit(db, request, 'read', 120, 3600);

    const body = await parseJson(request);
    if (!body || typeof body.id !== 'string' || !body.id.trim()) {
      return fail('INVALID_ID', 'Provide a valid clip id.', 400);
    }

    const row = await loadClipById(db, body.id.trim());
    if (!row) {
      return fail('NOT_FOUND', 'Secure clip not found.', 404);
    }
    if (isExpired(row)) {
      return fail('EXPIRED', 'This secure clip has expired.', 410);
    }
    if (row.status !== 'active') {
      return fail('READ_LIMIT_REACHED', 'This secure clip is no longer available.', 410);
    }

    const envelopeRaw = await kv.get(row.ciphertext_key);
    if (!envelopeRaw) {
      return fail('NOT_FOUND', 'Encrypted clip contents are no longer available.', 404);
    }

    const now = nowEpochSeconds();
    const updated = await db.prepare(
      `UPDATE clips
       SET
         read_count = read_count + 1,
         last_read_at = ?,
         status = CASE
           WHEN max_reads > 0 AND read_count + 1 >= max_reads THEN 'burned'
           ELSE status
         END
       WHERE
         id = ?
         AND status = 'active'
         AND expires_at > ?
         AND (max_reads = 0 OR read_count < max_reads)`
    ).bind(now, row.id, now).run();

    if (!updated.success || !updated.meta || updated.meta.changes < 1) {
      return fail('READ_LIMIT_REACHED', 'This secure clip was already opened or expired.', 410);
    }

    const refreshedRow = await loadClipById(db, row.id);
    return ok({
      clip: {
        ...mapClipRow(refreshedRow),
        envelope: JSON.parse(envelopeRaw)
      }
    });
  } catch (err) {
    if (err.code && err.status) {
      return fail(err.code, err.message, err.status);
    }
    return fail('INTERNAL_ERROR', 'Unable to read this secure clip right now.', 500);
  }
}
