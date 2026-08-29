const DEFAULT_PRODUCTS = [
  {
    name: 'ANC Cap - Yellow/Green',
    price: 250,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80',
    category: 'BUY'
  },
  {
    name: 'ANC Hoodie - Black',
    price: 550,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&auto=format&fit=crop&q=80',
    category: 'BUY'
  },
  {
    name: 'Golf Shirt - ANC Green',
    price: 450,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=900&auto=format&fit=crop&q=80',
    category: 'BUY'
  }
];

async function ensureProductsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      image TEXT,
      category TEXT NOT NULL DEFAULT 'BUY',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const count = await db.prepare('SELECT COUNT(*) AS total FROM products').first();
  const total = Number(count?.total || 0);

  if (total === 0) {
    for (const product of DEFAULT_PRODUCTS) {
      await db.prepare(
        'INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)'
      ).bind(product.name, product.price, product.image, product.category).run();
    }
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!env.REGALIA_DB) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = env.REGALIA_DB;

  if (request.method === 'GET') {
    try {
      await ensureProductsTable(db);
      const result = await db.prepare('SELECT * FROM products ORDER BY id ASC').all();
      return Response.json(result.results || []);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to load products.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'PUT') {
    try {
      await ensureProductsTable(db);
      const data = await request.json();

      const productIdValue = data && data.id !== undefined && data.id !== null && String(data.id).trim() !== ''
        ? Number(data.id)
        : null;
      const name = String(data?.name || '').trim();
      const price = Number(data?.price ?? 0);
      const image = String(data?.image || '').trim();
      const category = String(data?.category || 'BUY').trim() || 'BUY';

      if (!name) {
        return new Response(JSON.stringify({ error: 'Product name is required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!Number.isFinite(price)) {
        return new Response(JSON.stringify({ error: 'Product price is invalid.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      let rowId = productIdValue;

      if (productIdValue !== null && Number.isFinite(productIdValue)) {
        await db.prepare(
          'UPDATE products SET name = ?, price = ?, image = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(name, price, image, category, productIdValue).run();
        rowId = productIdValue;
      } else {
        const insertResult = await db.prepare(
          'INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)'
        ).bind(name, price, image, category).run();
        rowId = insertResult?.meta?.last_row_id ?? null;
      }

      if (rowId === null || rowId === undefined) {
        return new Response(JSON.stringify({ error: 'Unable to save product.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const saved = await db.prepare('SELECT * FROM products WHERE id = ?').bind(rowId).first();
      return Response.json(saved || { id: rowId, name, price, image, category });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to update product.' }), {
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
