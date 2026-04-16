import {
  fail,
  getBindings,
  ok,
  loadClipById,
  mapClipRow,
  isExpired,
  enforceRateLimit
} from '../_clip-utils.js';

export async function onRequestGet(context) {
  try {
    const { request, env, params } = context;
    const { db } = getBindings(env);
    await enforceRateLimit(db, request, 'meta', 120, 3600);

    const clipId = typeof params.id === 'string' ? params.id.trim() : '';
    if (!clipId) {
      return fail('INVALID_ID', 'Provide a valid clip id.', 400);
    }

    const row = await loadClipById(db, clipId);
    if (!row) {
      return fail('NOT_FOUND', 'Secure clip not found.', 404);
    }
    if (isExpired(row)) {
      return fail('EXPIRED', 'This secure clip has expired.', 410);
    }
    if (row.status !== 'active') {
      return fail('READ_LIMIT_REACHED', 'This secure clip is no longer available.', 410);
    }

    return ok({ clip: mapClipRow(row) });
  } catch (err) {
    if (err.code && err.status) {
      return fail(err.code, err.message, err.status);
    }
    return fail('INTERNAL_ERROR', 'Unable to load clip details right now.', 500);
  }
}
