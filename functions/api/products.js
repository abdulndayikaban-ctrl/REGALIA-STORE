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
    delivery_info: '4 working days before collection',
    shop_id: 'anc_regalia'
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
    delivery_info: '4 working days before collection',
    shop_id: 'anc_regalia'
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
    delivery_info: '4 working days before collection',
    shop_id: 'anc_regalia'
  }
];

const DEFAULT_SHOPS = [
  {
    id: 'anc_regalia',
    name: 'ANC REGALIA STYLE',
    slug: 'anc-regalia-style',
    owner_name: 'Abdul Divad Kabika',
    owner_email: 'abdul@regalia.store',
    logo_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&q=80',
    whatsapp: '27731234567',
    province: 'Eastern Cape'
  }
];

const TABLE_COLUMNS = {
  products: [
    'description', 'features', 'colors', 'sizes', 'delivery_info', 'shop_id', 'views', 'clicks', 'shares', 'followers_gained', 'stock', 'brand', 'display_zones'
  ],
  shops: ['id', 'name', 'slug', 'owner_name', 'owner_email', 'logo_url', 'whatsapp', 'province', 'created_at', 'product_count', 'is_full'],
  product_views: ['id', 'product_id', 'shop_id', 'session_id', 'traffic_source', 'referrer', 'province', 'device', 'viewed_at'],
  shop_followers: ['id', 'shop_id', 'session_id', 'source_product_id', 'created_at'],
  orders: ['id', 'shop_id', 'customer_name', 'phone', 'delivery_type', 'courier_fee', 'payment_type', 'payment_status', 'total', 'created_at'],
  order_items: ['id', 'order_id', 'product_id', 'qty', 'color', 'size', 'price']
};

function normalizeText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  const str = String(value).trim();
  return str || fallback;
}

async function ensureTableColumns(db, tableName, columns) {
  const info = await db.prepare(`PRAGMA table_info(${tableName})`).all();
  const names = new Set((info.results || []).map((col) => col.name));

  for (const column of columns) {
    if (!names.has(column)) {
      const definition = column === 'description' || column === 'features' || column === 'colors' || column === 'sizes' || column === 'delivery_info'
        ? `${column} TEXT`
        : column === 'product_count' || column === 'views' || column === 'clicks' || column === 'shares' || column === 'followers_gained' || column === 'stock' || column === 'qty' || column === 'courier_fee' || column === 'total' || column === 'price'
          ? `${column} INTEGER` 
          : column === 'delivery_info'
            ? `${column} TEXT DEFAULT '4 working days before collection'`
            : column === 'created_at' || column === 'viewed_at' || column === 'updated_at'
              ? `${column} DATETIME DEFAULT CURRENT_TIMESTAMP`
              : `${column} TEXT`;

      const finalDefinition = column === 'delivery_info' ? 'delivery_info TEXT DEFAULT "4 working days before collection"' : definition;
      await db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${finalDefinition}`).run();
    }
  }
}

async function ensureProductsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      image TEXT,
      category TEXT NOT NULL DEFAULT 'BUY',
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
      display_zones TEXT DEFAULT 'shopgrid',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await ensureTableColumns(db, 'products', TABLE_COLUMNS.products);

  const count = await db.prepare('SELECT COUNT(*) AS total FROM products').first();
  const total = Number(count?.total || 0);

  if (total === 0) {
    for (const product of DEFAULT_PRODUCTS) {
      await db.prepare(
        'INSERT INTO products (name, price, image, category, description, features, colors, sizes, delivery_info, shop_id, stock, brand) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        product.name,
        product.price,
        product.image || FALLBACK_IMAGE,
        product.category,
        product.description || '',
        product.features || '',
        product.colors || '',
        product.sizes || '',
        product.delivery_info || '4 working days before collection',
        product.shop_id || 'anc_regalia',
        Number(product.stock || 0),
        product.brand || 'ANC Regalia'
      ).run();
    }
  }
}

async function ensureShopsTable(db) {
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

  await ensureTableColumns(db, 'shops', TABLE_COLUMNS.shops);

  for (const shop of DEFAULT_SHOPS) {
    const existing = await db.prepare('SELECT id FROM shops WHERE id = ?').bind(shop.id).first();
    if (!existing) {
      await db.prepare(
        'INSERT INTO shops (id, name, slug, owner_name, owner_email, logo_url, whatsapp, province, product_count, is_full) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(shop.id, shop.name, shop.slug, shop.owner_name, shop.owner_email, shop.logo_url, shop.whatsapp, shop.province, 0, 0).run();
    }
  }
}

async function ensureProductViewsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS product_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT,
      shop_id TEXT,
      session_id TEXT,
      traffic_source TEXT,
      referrer TEXT,
      province TEXT,
      device TEXT,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await ensureTableColumns(db, 'product_views', TABLE_COLUMNS.product_views);
}

async function ensureShopFollowersTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS shop_followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id TEXT,
      session_id TEXT,
      source_product_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await ensureTableColumns(db, 'shop_followers', TABLE_COLUMNS.shop_followers);
}

async function ensureOrdersTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      shop_id TEXT,
      customer_name TEXT,
      phone TEXT,
      delivery_type TEXT,
      courier_fee REAL DEFAULT 0,
      payment_type TEXT,
      payment_status TEXT DEFAULT 'pending',
      total REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  await ensureTableColumns(db, 'orders', TABLE_COLUMNS.orders);
}

async function ensureOrderItemsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      product_id TEXT,
      qty INTEGER,
      color TEXT,
      size TEXT,
      price REAL
    )
  `).run();
  await ensureTableColumns(db, 'order_items', TABLE_COLUMNS.order_items);
}

async function ensureAllTables(db) {
  await ensureProductsTable(db);
  await ensureShopsTable(db);
  await ensureProductViewsTable(db);
  await ensureShopFollowersTable(db);
  await ensureOrdersTable(db);
  await ensureOrderItemsTable(db);
}

function normalizeProductRecord(product) {
  return {
    ...product,
    image: normalizeText(product.image, FALLBACK_IMAGE),
    category: normalizeText(product.category, 'BUY'),
    brand: normalizeText(product.brand, 'ANC Regalia'),
    stock: Number(product.stock ?? 0),
    description: normalizeText(product.description, ''),
    features: normalizeText(product.features, ''),
    colors: normalizeText(product.colors, ''),
    sizes: normalizeText(product.sizes, ''),
    delivery_info: normalizeText(product.delivery_info, '4 working days before collection'),
    shop_id: normalizeText(product.shop_id, 'anc_regalia'),
    display_zones: normalizeText(product.display_zones, 'shopgrid'),
    views: Number(product.views ?? 0),
    clicks: Number(product.clicks ?? 0),
    shares: Number(product.shares ?? 0),
    followers_gained: Number(product.followers_gained ?? 0)
  };
}

async function resolveShopId(db, value) {
  const candidate = normalizeText(value, 'anc_regalia');
  if (!candidate) return 'anc_regalia';
  const direct = await db.prepare('SELECT id FROM shops WHERE id = ? OR slug = ?').bind(candidate, candidate).first();
  if (direct?.id) return direct.id;

  const fallbackSlug = String(candidate).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'anc-regalia';
  const generatedId = fallbackSlug;
  await db.prepare('INSERT OR IGNORE INTO shops (id, name, slug, owner_name, whatsapp, province, product_count) VALUES (?, ?, ?, ?, ?, ?, 0)')
    .bind(generatedId, 'ANC REGALIA STYLE', fallbackSlug, 'Owner', '27731234567', 'Eastern Cape')
    .run();
  return generatedId;
}

async function syncShopProductCount(db, shopId) {
  const shopCount = await db.prepare('SELECT COUNT(*) AS total FROM products WHERE shop_id = ?').bind(shopId).first();
  const total = Number(shopCount?.total || 0);
  await db.prepare('UPDATE shops SET product_count = ?, is_full = ? WHERE id = ?').bind(total, total >= 450 ? 1 : 0, shopId).run();
  return total;
}

async function getProductShopName(db, shopId) {
  const shop = await db.prepare('SELECT name, slug FROM shops WHERE id = ? OR slug = ?').bind(shopId, shopId).first();
  return shop ? { name: shop.name, slug: shop.slug } : { name: 'ANC REGALIA STYLE', slug: 'anc-regalia-style' };
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  if (!env.REGALIA_DB) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = env.REGALIA_DB;
  const routeId = params?.id ? String(params.id) : null;

  if (request.method === 'GET') {
    try {
      await ensureAllTables(db);
      const search = normalizeText(searchParams.get('search'), '');
      const shop = normalizeText(searchParams.get('shop'), '');
      const shopId = normalizeText(searchParams.get('shop_id'), '');
      const shopSlug = normalizeText(searchParams.get('shop_slug'), '');
      const productId = routeId || normalizeText(searchParams.get('id'), '');

      let sql = 'SELECT p.*, s.name AS shop_name, s.slug AS shop_slug FROM products p LEFT JOIN shops s ON s.id = p.shop_id';
      const where = [];
      const binds = [];

      if (productId) {
        where.push('p.id = ?');
        binds.push(productId);
      }
      if (search) {
        where.push('(LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.brand, "")) LIKE ? OR LOWER(COALESCE(s.name, "")) LIKE ? OR LOWER(COALESCE(s.slug, "")) LIKE ?)');
        binds.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
      }
      if (shop) {
        where.push('(p.shop_id = ? OR s.slug = ?)');
        binds.push(shop, shop);
      }
      if (shopId) {
        where.push('p.shop_id = ?');
        binds.push(shopId);
      }
      if (shopSlug) {
        where.push('(p.shop_id = ? OR s.slug = ?)');
        binds.push(shopSlug, shopSlug);
      }

      if (where.length) sql += ' WHERE ' + where.join(' AND ');
      sql += ' ORDER BY id DESC';

      const result = await db.prepare(sql).bind(...binds).all();
      const records = (result.results || []).map((product) => {
        const normalized = normalizeProductRecord(product);
        return {
          ...normalized,
          shop_name: normalizeText(product.shop_name, 'ANC REGALIA STYLE'),
          shop_slug: normalizeText(product.shop_slug, 'anc-regalia-style')
        };
      });

      if (productId && records.length === 1) {
        const shopInfo = await getProductShopName(db, records[0].shop_id);
        return Response.json({ ...records[0], shop_name: shopInfo.name, shop_slug: shopInfo.slug });
      }

      return Response.json(records);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to load products.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      await ensureAllTables(db);
      const body = await request.json();
      const productIdValue = routeId || normalizeText(body?.id || '', '');
      const productNumberId = productIdValue ? Number(productIdValue) : null;
      const name = normalizeText(body?.name || '', '');
      const price = Number(body?.price ?? 0);
      const image = normalizeText(body?.image || body?.image_url || '', FALLBACK_IMAGE);
      const category = normalizeText(body?.category || 'BUY', 'BUY');
      const brand = normalizeText(body?.brand || 'ANC Regalia', 'ANC Regalia');
      const stock = Number(body?.stock ?? 0);
      const description = normalizeText(body?.description || '', '');
      const features = normalizeText(body?.features || '', '');
      const colors = normalizeText(body?.colors || '', '');
      const sizes = normalizeText(body?.sizes || '', '');
      const deliveryInfo = normalizeText(body?.delivery_info || body?.expectedDelivery || '4 working days before collection', '4 working days before collection');
      const shopIdInput = normalizeText(body?.shop_id || body?.shop || 'anc_regalia', 'anc_regalia');
      const shopId = await resolveShopId(db, shopIdInput);

      if (!name) {
        return new Response(JSON.stringify({ error: 'Product name is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      if (!Number.isFinite(price)) {
        return new Response(JSON.stringify({ error: 'Product price is invalid.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const shopExists = await db.prepare('SELECT id FROM shops WHERE id = ? OR slug = ?').bind(shopIdInput, shopIdInput).first();
      if (!shopExists) {
        const newSlug = String(shopIdInput).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'anc-regalia';
        const uniqueId = String(shopIdInput || newSlug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'anc-regalia';
        await db.prepare('INSERT OR IGNORE INTO shops (id, name, slug, owner_name, whatsapp, province, product_count) VALUES (?, ?, ?, ?, ?, ?, 0)').bind(uniqueId, 'ANC REGALIA STYLE', newSlug, 'Owner', '27731234567', 'Eastern Cape').run();
      }

      if (productNumberId !== null && Number.isFinite(productNumberId)) {
        const check = await db.prepare('SELECT shop_id FROM products WHERE id = ?').bind(productNumberId).first();
        if (check && check.shop_id && check.shop_id !== shopId) {
          const count = await db.prepare('SELECT COUNT(*) AS total FROM products WHERE shop_id = ?').bind(shopId).first();
          if (Number(count?.total || 0) >= 500) {
            return new Response(JSON.stringify({ error: 'This shop has reached the 500 product limit.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
        }

        await db.prepare(
          'UPDATE products SET name = ?, price = ?, image = ?, category = ?, description = ?, features = ?, colors = ?, sizes = ?, delivery_info = ?, shop_id = ?, stock = ?, brand = ?, display_zones = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(name, price, image, category, description, features, colors, sizes, deliveryInfo, shopId, stock, brand, normalizeText(body?.display_zones || 'shopgrid', 'shopgrid'), productNumberId).run();
      } else {
        const count = await db.prepare('SELECT COUNT(*) AS total FROM products WHERE shop_id = ?').bind(shopId).first();
        if (Number(count?.total || 0) >= 500) {
          return new Response(JSON.stringify({ error: 'This shop has reached the 500 product limit.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const insert = await db.prepare(
          'INSERT INTO products (name, price, image, category, description, features, colors, sizes, delivery_info, shop_id, stock, brand, display_zones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(name, price, image, category, description, features, colors, sizes, deliveryInfo, shopId, stock, brand, normalizeText(body?.display_zones || 'shopgrid', 'shopgrid')).run();
        const lastId = insert?.meta?.last_row_id ?? null;
        if (lastId) {
          await syncShopProductCount(db, shopId);
          const productRecord = await db.prepare('SELECT * FROM products WHERE id = ?').bind(lastId).first();
          return Response.json(normalizeProductRecord(productRecord));
        }
      }

      await syncShopProductCount(db, shopId);
      const saved = await db.prepare('SELECT * FROM products WHERE id = ?').bind(productNumberId || productIdValue).first();
      return Response.json(normalizeProductRecord(saved));
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to update product.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
}
