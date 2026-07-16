// POST /api/okman/remove-bg  { assetId } → { jobId }
import { generate, json, MODEL_REMOVE_BG } from './_scenario.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const assetId = body.assetId;
    if (!assetId) return json({ error: 'assetId가 필요합니다.' }, 400);

    const jobId = await generate(env, MODEL_REMOVE_BG, { image: assetId, preserveAlpha: true });
    return json({ jobId });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
