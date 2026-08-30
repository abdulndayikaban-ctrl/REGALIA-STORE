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
    const shopId = String(payload?.shop_id || '').trim();
    const sessionId = String(payload?.session_id || '').trim() || `session_${Date.now()}`;
    const trafficSource = String(payload?.traffic_source || 'Direct').trim();
    const referrer = String(payload?.referrer || '').trim();
    const province = String(payload?.province || 'Unknown').trim();
    const device = String(payload?.device || 'desktop').trim();

    if (!productId) {
      return new Response(JSON.stringify({ error: 'product_id is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const db = env.REGALIA_DB;
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL DEFAULT 0,
        image TEXT,
        category TEXT DEFAULT 'BUY',
        description TEXT,
        features TEXT,
        colors TEXT,
        sizes TEXT,
        delivery_info TEXT DEFAULT '4 working days before collection',
        shop_id TEXT,
        views INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        followers_gained INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 0,
        brand TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS product_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT,
        shop_id TEXT,
        session_id TEXT,
        traffic_source TEXT,
        referrer TEXT,
        search_term TEXT,
        province TEXT,
        device TEXT,
        age_range TEXT,
        interest TEXT,
        time_spent INTEGER DEFAULT 0,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const searchTerm = String(payload?.search_term || '').trim();
    const ageRange = String(payload?.age_range || '').trim();
    const interest = String(payload?.interest || '').trim();
    const timeSpent = Number(payload?.time_spent || 0);

    await db.prepare('UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = ?').bind(productId).run();
    await db.prepare('INSERT INTO product_views (product_id, shop_id, session_id, traffic_source, referrer, search_term, province, device, age_range, interest, time_spent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(productId, shopId, sessionId, trafficSource, referrer, searchTerm, province, device, ageRange, interest, timeSpent).run();

    return Response.json({ ok: true, product_id: productId, views: 1 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to track product view.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
