export async function onRequest(context) {
  const { request, env, params } = context;

  if (!env.REGALIA_IMAGES) {
    return new Response(JSON.stringify({ error: 'REGALIA_IMAGES binding is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const key = decodeURIComponent(params?.key || '');

  if (!key) {
    return new Response('Image key is required.', { status: 400 });
  }

  try {
    const object = await env.REGALIA_IMAGES.get(key);

    if (!object) {
      return new Response('Image not found.', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400');

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to load image.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
