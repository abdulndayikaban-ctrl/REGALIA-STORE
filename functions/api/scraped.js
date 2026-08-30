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
    CREATE TABLE IF NOT EXISTS scraped_products (
      id TEXT PRIMARY KEY,
      original_logo_url TEXT,
      cleaned_image_url TEXT,
      title TEXT,
      price REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  if (request.method === 'GET') {
    const status = new URL(request.url).searchParams.get('status') || 'pending';
    const rows = await db.prepare('SELECT * FROM scraped_products WHERE status = ? ORDER BY created_at DESC').bind(status).all();
    return Response.json(rows.results || []);
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const action = String(body?.action || '').trim();
      const id = String(body?.id || '').trim();

      if (!action || !id) {
        return new Response(JSON.stringify({ error: 'action and id are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (action === 'reject') {
        await db.prepare('DELETE FROM scraped_products WHERE id = ?').bind(id).run();
        return Response.json({ ok: true, action: 'reject', id });
      }

      if (action === 'approve') {
        const row = await db.prepare('SELECT * FROM scraped_products WHERE id = ?').bind(id).first();
        if (!row) {
          return new Response(JSON.stringify({ error: 'Scraped product not found.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const image = String(row.cleaned_image_url || row.original_logo_url || 'https://placehold.co/600x600/111/FFD700?text=No+Image').trim();
        const productName = String(row.title || 'Scraped Product').trim();
        const price = Number(row.price || 0);
        const insert = await db.prepare(`
          INSERT INTO products (name, price, image, category, description, features, colors, sizes, delivery_info, shop_id, stock, brand, display_zones)
          VALUES (?, ?, ?, 'BUY', '', '', '', '', '4 working days before collection', 'anc_regalia', 1, 'ANC Regalia', 'shopgrid')
        `).bind(productName, price, image).run();

        await db.prepare('UPDATE scraped_products SET status = ? WHERE id = ?').bind('approved', id).run();

        return Response.json({ ok: true, action: 'approve', product_id: insert.meta?.last_row_id || null });
      }

      return new Response(JSON.stringify({ error: 'Unsupported action.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to process scraped product.' }), {
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
