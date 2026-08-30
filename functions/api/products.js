const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=80';

const DEFAULT_PRODUCTS = [
  {
    name: 'ANC Cap - Yellow/Green',
    price: 250,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80',
    category: 'BUY',
    brand: 'ANC Regalia',
    stock: 12,
    description: 'Premium statement cap made for everyday wear with a bold ANC-inspired finish.',
    features: 'Adjustable strap\nCotton twill\nEmbroidered logo',
    colors: 'Yellow, Green, Black',
    sizes: 'S, M, L, XL, XXL',
    delivery_info: '4 working days before collection'
  },
  {
    name: 'ANC Hoodie - Black',
    price: 550,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&auto=format&fit=crop&q=80',
    category: 'BUY',
    brand: 'ANC Regalia',
    stock: 8,
    description: 'Heavyweight fleece hoodie with a clean premium finish and relaxed fit.',
    features: '320gsm fleece\nFront kangaroo pocket\nSoft brushed interior',
    colors: 'Black, Grey, White',
    sizes: 'S, M, L, XL, XXL',
    delivery_info: '4 working days before collection'
  },
  {
    name: 'Golf Shirt - ANC Green',
    price: 450,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=900&auto=format&fit=crop&q=80',
    category: 'BUY',
    brand: 'ANC Regalia',
    stock: 10,
    description: 'Smart golf shirt with breathable fabric and a polished ANC-inspired look.',
    features: 'Moisture-wicking\nCollar design\nLightweight finish',
    colors: 'Green, White, Black',
    sizes: 'S, M, L, XL, XXL',
    delivery_info: '4 working days before collection'
  }
];

function normalizeText(value, fallback = '') {
  const result = typeof value === 'string' ? value.trim() : '';
  return result || fallback;
}

async function ensureProductsTable(db) {
  const createSql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      image TEXT,
      category TEXT NOT NULL DEFAULT 'BUY',
      brand TEXT DEFAULT 'ANC Regalia',
      stock INTEGER DEFAULT 0,
      description TEXT,
      features TEXT,
      colors TEXT,
      sizes TEXT,
      delivery_info TEXT DEFAULT '4 working days before collection',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await db.prepare(createSql).run();

  const migrationSql = [
    'ALTER TABLE products ADD COLUMN description TEXT',
    'ALTER TABLE products ADD COLUMN features TEXT',
    'ALTER TABLE products ADD COLUMN colors TEXT',
    'ALTER TABLE products ADD COLUMN sizes TEXT',
    'ALTER TABLE products ADD COLUMN delivery_info TEXT DEFAULT "4 working days before collection"',
    'ALTER TABLE products ADD COLUMN brand TEXT DEFAULT "ANC Regalia"',
    'ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0'
  ];

  for (const sql of migrationSql) {
    try {
      await db.prepare(sql).run();
    } catch (error) {
      const msg = String(error?.message || '');
      if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
        throw error;
      }
    }
  }

  const count = await db.prepare('SELECT COUNT(*) AS total FROM products').first();
  const total = Number(count?.total || 0);

  if (total === 0) {
    for (const product of DEFAULT_PRODUCTS) {
      await db.prepare(
        'INSERT INTO products (name, price, image, category, brand, stock, description, features, colors, sizes, delivery_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        product.name,
        product.price,
        product.image || FALLBACK_IMAGE,
        product.category,
        product.brand || 'ANC Regalia',
        Number(product.stock || 0),
        product.description || '',
        product.features || '',
        product.colors || '',
        product.sizes || '',
        product.delivery_info || '4 working days before collection'
      ).run();
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
      return Response.json((result.results || []).map((product) => ({
        ...product,
        image: normalizeText(product.image, FALLBACK_IMAGE),
        category: normalizeText(product.category, 'BUY'),
        brand: normalizeText(product.brand, 'ANC Regalia'),
        stock: Number(product.stock ?? 0),
        description: normalizeText(product.description, ''),
        features: normalizeText(product.features, ''),
        colors: normalizeText(product.colors, ''),
        sizes: normalizeText(product.sizes, ''),
        delivery_info: normalizeText(product.delivery_info, '4 working days before collection')
      })));
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
      const image = normalizeText(String(data?.image || ''), FALLBACK_IMAGE);
      const category = normalizeText(String(data?.category || 'BUY'), 'BUY');
      const brand = normalizeText(String(data?.brand || 'ANC Regalia'), 'ANC Regalia');
      const stock = Number(data?.stock ?? 0);
      const description = normalizeText(String(data?.description || ''));
      const features = normalizeText(String(data?.features || ''));
      const colors = normalizeText(String(data?.colors || ''));
      const sizes = normalizeText(String(data?.sizes || ''));
      const deliveryInfo = normalizeText(String(data?.delivery_info || '4 working days before collection'), '4 working days before collection');

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
          'UPDATE products SET name = ?, price = ?, image = ?, category = ?, brand = ?, stock = ?, description = ?, features = ?, colors = ?, sizes = ?, delivery_info = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(
          name,
          price,
          image,
          category,
          brand,
          stock,
          description,
          features,
          colors,
          sizes,
          deliveryInfo,
          productIdValue
        ).run();
        rowId = productIdValue;
      } else {
        const insertResult = await db.prepare(
          'INSERT INTO products (name, price, image, category, brand, stock, description, features, colors, sizes, delivery_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          name,
          price,
          image,
          category,
          brand,
          stock,
          description,
          features,
          colors,
          sizes,
          deliveryInfo
        ).run();
        rowId = insertResult?.meta?.last_row_id ?? null;
      }

      if (rowId === null || rowId === undefined) {
        return new Response(JSON.stringify({ error: 'Unable to save product.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const saved = await db.prepare('SELECT * FROM products WHERE id = ?').bind(rowId).first();
      return Response.json({
        ...saved,
        image: normalizeText(saved?.image, FALLBACK_IMAGE),
        category: normalizeText(saved?.category, 'BUY'),
        brand: normalizeText(saved?.brand, 'ANC Regalia'),
        stock: Number(saved?.stock ?? 0),
        description: normalizeText(saved?.description, ''),
        features: normalizeText(saved?.features, ''),
        colors: normalizeText(saved?.colors, ''),
        sizes: normalizeText(saved?.sizes, ''),
        delivery_info: normalizeText(saved?.delivery_info, '4 working days before collection')
      });
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
