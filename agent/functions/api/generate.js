// POST /api/okman/generate  { prompt } → { jobId }
import { generate, buildPrompt, json, MODEL_IMAGE } from './_scenario.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = (body.prompt || '').trim();
    if (!prompt) return json({ error: '프롬프트(prompt)가 필요합니다.' }, 400);

    const character = env.SCENARIO_CHARACTER_ASSET_ID;
    if (!character) return json({ error: 'SCENARIO_CHARACTER_ASSET_ID 환경변수가 없습니다.' }, 500);

    const jobId = await generate(env, MODEL_IMAGE, {
      prompt: buildPrompt(prompt),
      referenceImages: [character],
      numOutputs: 1,
      aspectRatio: '1:1',
      resolution: '2k',
    });
    return json({ jobId });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
