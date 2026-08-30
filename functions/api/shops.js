export async function onRequest(context) {
  const { request, env } = context;
  const db = env.REGALIA_DB;

  if (!db) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Ensure shops table exists
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY,
      name TEXT,
      slug TEXT UNIQUE,
      owner_name TEXT,
      owner_email TEXT,
      logo_url TEXT,
      whatsapp TEXT,
      province TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      product_count INTEGER DEFAULT 0,
      is_full INTEGER DEFAULT 0
    )
  `).run();

  if (request.method === 'GET') {
    try {
      const rows = await db.prepare('SELECT id, name, slug, owner_name, logo_url, whatsapp, province, product_count, created_at FROM shops ORDER BY created_at DESC').all();
      return Response.json(rows.results || []);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to load shops.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const id = String(body?.id || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const name = String(body?.name || '').trim();
      const slug = String(body?.slug || id).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const ownerName = String(body?.owner_name || '').trim();
      const ownerEmail = String(body?.owner_email || '').trim();
      const whatsapp = String(body?.whatsapp || '').trim();
      const province = String(body?.province || '').trim();

      if (!id || !name || !slug) {
        return new Response(JSON.stringify({ error: 'id, name, and slug are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if shop already exists
      const existing = await db.prepare('SELECT id FROM shops WHERE id = ? OR slug = ?').bind(id, slug).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'Shop already exists.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create shop
      const result = await db.prepare(
        'INSERT INTO shops (id, name, slug, owner_name, owner_email, whatsapp, province, product_count, is_full) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)'
      ).bind(id, name, slug, ownerName, ownerEmail, whatsapp, province).run();

      return Response.json({
        ok: true,
        id,
        name,
        slug,
        message: 'Shop created successfully'
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to create shop.' }), {
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
