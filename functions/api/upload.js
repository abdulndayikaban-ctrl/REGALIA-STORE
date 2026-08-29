export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!env.REGALIA_IMAGES) {
    return new Response(JSON.stringify({ error: 'REGALIA_IMAGES binding is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file uploaded.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Only image files are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const safeName = (file.name || 'upload-image')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();

    const key = `products/${Date.now()}-${safeName || 'upload-image'}`;
    const arrayBuffer = await file.arrayBuffer();

    await env.REGALIA_IMAGES.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'image/jpeg'
      }
    });

    const url = new URL(`/api/images/${encodeURIComponent(key)}`, request.url).toString();

    return Response.json({
      key,
      url,
      message: 'Image uploaded successfully.'
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Upload failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
