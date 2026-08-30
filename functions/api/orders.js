export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const db = env.REGALIA_DB;

  if (!db) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'GET') {
    try {
      const rows = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100').all();
      return Response.json(rows.results || []);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to load orders.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (request.method === 'POST') {
    try {
      const payload = await request.json();
      const orderId = String(payload?.id || `ORD-${Date.now()}`);
      const shopId = String(payload?.shop_id || '').trim();
      const customerName = String(payload?.customer_name || '').trim();
      const phone = String(payload?.phone || '').trim();
      const deliveryType = String(payload?.delivery_type || 'Collection').trim();
      const courierFee = Number(payload?.courier_fee || 0);
      const paymentType = String(payload?.payment_type || 'Pay on Collection').trim();
      const paymentStatus = String(payload?.payment_status || 'pending').trim();
      const total = Number(payload?.total || 0);
      const items = Array.isArray(payload?.items) ? payload.items : [];

      if (!shopId || !customerName || !phone || !items.length) {
        return new Response(JSON.stringify({ error: 'shop_id, customer_name, phone, and at least one item are required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

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

      await db.prepare('INSERT INTO orders (id, shop_id, customer_name, phone, delivery_type, courier_fee, payment_type, payment_status, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(orderId, shopId, customerName, phone, deliveryType, courierFee, paymentType, paymentStatus, total).run();

      for (const item of items) {
        await db.prepare('INSERT INTO order_items (order_id, product_id, qty, color, size, price) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(orderId, String(item.product_id || '').trim(), Number(item.qty || 1), String(item.color || '').trim(), String(item.size || '').trim(), Number(item.price || 0)).run();
      }

      return Response.json({ ok: true, order_id: orderId, total, payment_status: paymentStatus, delivery_type: deliveryType });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Unable to create order.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
}
