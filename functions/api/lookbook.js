export async function onRequest(context) {
  const { request, env } = context;
  if (!env.REGALIA_DB) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = env.REGALIA_DB;

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS scene_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id TEXT,
      product_id TEXT,
      image_url TEXT,
      x_percent REAL DEFAULT 50,
      y_percent REAL DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  if (request.method === 'GET') {
    const rows = await db.prepare('SELECT * FROM scene_products ORDER BY created_at DESC LIMIT 50').all();
    return Response.json(rows.results || []);
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const shopId = String(body?.shop_id || '').trim();
      const productId = String(body?.product_id || '').trim();
      const imageUrl = String(body?.image_url || '').trim();
      const xPercent = Number(body?.x_percent ?? 50);
      const yPercent = Number(body?.y_percent ?? 50);

      if (!shopId || !productId || !imageUrl) {
        return new Response(JSON.stringify({ error: 'shop_id, product_id, and image_url are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const result = await db.prepare('INSERT INTO scene_products (shop_id, product_id, image_url, x_percent, y_percent) VALUES (?, ?, ?, ?, ?)')
        .bind(shopId, productId, imageUrl, xPercent, yPercent)
        .run();

      return Response.json({ ok: true, id: result.meta?.last_row_id || null });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to save lookbook tag.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
