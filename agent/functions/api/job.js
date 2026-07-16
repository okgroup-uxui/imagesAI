// GET /api/okman/job?id=<jobId> → { status, progress, assetIds, images:[url], error }
import { jobStatus, assetUrl, json } from './_scenario.js';

export async function onRequestGet({ request, env }) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return json({ error: 'job id가 필요합니다.' }, 400);

    const j = await jobStatus(env, id);
    let images = [];
    if (j.status === 'success' && j.assetIds.length) {
      images = (await Promise.all(j.assetIds.map((a) => assetUrl(env, a)))).filter(Boolean);
    }
    return json({ status: j.status, progress: j.progress, assetIds: j.assetIds, images, error: j.error });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
