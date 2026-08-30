export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  if (!env.REGALIA_DB) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const payload = await request.json();
    const productId = String(payload?.product_id || '').trim();
    if (!productId) {
      return new Response(JSON.stringify({ error: 'product_id is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const db = env.REGALIA_DB;
    await db.prepare('UPDATE products SET shares = COALESCE(shares, 0) + 1 WHERE id = ?').bind(productId).run();
    return Response.json({ ok: true, product_id: productId, shares: 1 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to record share.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
