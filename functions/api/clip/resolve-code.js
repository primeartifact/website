import {
  fail,
  getBindings,
  ok,
  parseJson,
  normalizeCode,
  loadClipByCode,
  mapClipRow,
  isExpired,
  enforceRateLimit
} from '../_clip-utils.js';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { db } = getBindings(env);
    await enforceRateLimit(db, request, 'resolve', 60, 3600);

    const body = await parseJson(request);
    if (!body) {
      return fail('INVALID_JSON', 'Send a valid JSON payload.', 400);
    }

    const shortCode = normalizeCode(body.shortCode);
    if (shortCode.length !== 7) {
      return fail('INVALID_CODE', 'Enter a valid 6-character short code.', 400);
    }

    const row = await loadClipByCode(db, shortCode);
    if (!row) {
      return fail('NOT_FOUND', 'No clip was found for that short code.', 404);
    }
    if (isExpired(row)) {
      return fail('EXPIRED', 'That clip has already expired.', 410);
    }
    if (row.status !== 'active') {
      return fail('READ_LIMIT_REACHED', 'That clip is no longer available.', 410);
    }

    return ok({ clip: mapClipRow(row) });
  } catch (err) {
    if (err.code && err.status) {
      return fail(err.code, err.message, err.status);
    }
    return fail('INTERNAL_ERROR', 'Unable to resolve that short code right now.', 500);
  }
}
