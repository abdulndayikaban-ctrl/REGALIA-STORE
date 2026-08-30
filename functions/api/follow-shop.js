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
    const shopId = String(payload?.shop_id || '').trim();
    const productId = String(payload?.product_id || '').trim();
    const sessionId = String(payload?.session_id || '').trim() || `follow_${Date.now()}`;
    if (!shopId) {
      return new Response(JSON.stringify({ error: 'shop_id is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const db = env.REGALIA_DB;
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS shop_followers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_id TEXT,
        session_id TEXT,
        source_product_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare('INSERT INTO shop_followers (shop_id, session_id, source_product_id) VALUES (?, ?, ?)')
      .bind(shopId, sessionId, productId || '').run();
    await db.prepare('UPDATE products SET followers_gained = COALESCE(followers_gained, 0) + 1 WHERE shop_id = ?').bind(shopId).run();
    if (productId) {
      await db.prepare('UPDATE products SET followers_gained = COALESCE(followers_gained, 0) + 1 WHERE id = ?').bind(productId).run();
    }
    return Response.json({ ok: true, shop_id: shopId, product_id: productId || null, followed: true });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to record follow.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
