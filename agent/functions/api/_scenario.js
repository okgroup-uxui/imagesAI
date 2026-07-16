// Scenario API 공통 헬퍼 — Cloudflare Pages Functions 용 (ESM)
// 키는 Cloudflare Secrets(환경변수)에서만 읽는다. 코드/레포에 키 없음.
//
// (functions/api/ 아래 = /api/... 경로로 매핑됨, Cloudflare Pages 파일 기반 라우팅)
//
// 워크플로우 "run"은 published(ready) 상태가 필요한데 UI에 publish 버튼이 없어
// 불가능했다. 대신 Scenario 웹앱과 동일하게 각 모델 노드를 직접 호출해 체이닝한다.
//   ① model_xai-grok-imagine-image : 캐릭터 레퍼런스 + 프롬프트 → 이모트 이미지
//   ② model_bria-remove-background : ①결과 → 배경 투명 제거

const BASE = 'https://api.cloud.scenario.com/v1';
export const MODEL_IMAGE = 'model_xai-grok-imagine-image';
export const MODEL_REMOVE_BG = 'model_bria-remove-background';

export function authHeader(env) {
  const key = env.SCENARIO_API_KEY;
  const secret = env.SCENARIO_API_SECRET;
  if (!key || !secret) throw new Error('SCENARIO_API_KEY / SCENARIO_API_SECRET 환경변수가 없습니다.');
  return 'Basic ' + btoa(`${key}:${secret}`);
}

// Prompt_Builder 노드 템플릿. 사용자 프롬프트를 "following poses:" 자리에 끼운다.
export function buildPrompt(userPrompt) {
  return `The reference images provided show the "읏맨" character in various poses and action shots.
Generate single full-body emote variations of this character, with all body parts visible, on a white background, including the following poses: ${userPrompt}.

If the prompt was written in Korean, please translate it into English. However, "읏맨" is a proper noun.
Keep the exact same character design, face, colors, outfit, proportions, and art style across all variations.
Create expressive poses with different body language and gestures.

Keep the eye design, no under eyebag, small black dot-like pupil.
Devoid poorly drawn hands.
By default, the character has its eyes open and is smiling.
If the character has their eyes closed, there is no aegyo-sal.

The pose should be clearly distinct and suitable for game emotes.
1:1 Ratio.`;
}

export async function generate(env, modelId, body) {
  const r = await fetch(`${BASE}/generate/custom/${modelId}`, {
    method: 'POST',
    headers: { Authorization: authHeader(env), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${modelId} 호출 실패 (${r.status}): ${JSON.stringify(j)}`);
  const jobId = j.job?.jobId || j.jobId;
  if (!jobId) throw new Error(`${modelId}: jobId를 받지 못함`);
  return jobId;
}

export async function jobStatus(env, jobId) {
  const r = await fetch(`${BASE}/jobs/${jobId}`, { headers: { Authorization: authHeader(env) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`job 조회 실패 (${r.status})`);
  const job = j.job || j;
  return {
    status: job.status,
    progress: job.progress || 0,
    assetIds: job.metadata?.assetIds || [],
    error: job.metadata?.error || null,
  };
}

export async function assetUrl(env, assetId) {
  const r = await fetch(`${BASE}/assets/${assetId}`, { headers: { Authorization: authHeader(env) } });
  const j = await r.json().catch(() => ({}));
  return j.asset?.url || j.url || null;
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
