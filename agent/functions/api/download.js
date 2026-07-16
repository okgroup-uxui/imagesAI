// GET /api/okman/download?asset=<assetId> → 이미지를 attachment로 다운로드
import { assetUrl } from './_scenario.js';

export async function onRequestGet({ request, env }) {
  try {
    const assetId = new URL(request.url).searchParams.get('asset');
    if (!assetId) return new Response('asset 누락', { status: 400 });

    const url = await assetUrl(env, assetId);
    if (!url) return new Response('이미지를 찾을 수 없습니다.', { status: 404 });

    const r = await fetch(url);
    if (!r.ok) return new Response('이미지 다운로드 실패', { status: 502 });

    return new Response(r.body, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="okman_${assetId}.png"`,
      },
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
