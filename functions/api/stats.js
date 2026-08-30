export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  if (!env.REGALIA_DB) {
    return new Response(JSON.stringify({ error: 'REGALIA_DB binding is missing.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const db = env.REGALIA_DB;
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    const totalProducts = await db.prepare('SELECT COUNT(*) AS total FROM products').first();
    const addedToday = await db.prepare('SELECT COUNT(*) AS total FROM products WHERE date(created_at) = date("now")').first();
    const addedWeek = await db.prepare('SELECT COUNT(*) AS total FROM products WHERE created_at >= datetime("now", "-7 days")').first();
    const totalShops = await db.prepare('SELECT COUNT(*) AS total FROM shops').first();
    const shopsWeek = await db.prepare('SELECT COUNT(*) AS total FROM shops WHERE created_at >= datetime("now", "-7 days")').first();
    const fullShops = await db.prepare('SELECT COUNT(*) AS total FROM (SELECT shop_id, COUNT(*) AS product_count FROM products GROUP BY shop_id HAVING COUNT(*) >= 450)').first();
    const viewsToday = await db.prepare('SELECT COALESCE(SUM(views),0) AS total FROM products WHERE date(updated_at) = date("now")').first();
    const ordersToday = await db.prepare('SELECT COUNT(*) AS total FROM orders WHERE date(created_at) = date("now")').first();

    let productMetrics = null;
    if (productId) {
      productMetrics = await db.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
      if (productMetrics) {
        const traffic = await db.prepare('SELECT traffic_source, COUNT(*) AS total FROM product_views WHERE product_id = ? GROUP BY traffic_source ORDER BY total DESC').bind(productId).all();
        const provinces = await db.prepare('SELECT province, COUNT(*) AS total FROM product_views WHERE product_id = ? GROUP BY province ORDER BY total DESC').bind(productId).all();
        const devices = await db.prepare('SELECT device, COUNT(*) AS total FROM product_views WHERE product_id = ? GROUP BY device ORDER BY total DESC').bind(productId).all();
        productMetrics = {
          ...productMetrics,
          trafficSourceBreakdown: traffic.results || [],
          provinceBreakdown: provinces.results || [],
          deviceBreakdown: devices.results || []
        };
      }
    }

    const topProducts = await db.prepare('SELECT id, name, views, clicks, shares, followers_gained FROM products ORDER BY COALESCE(views,0) DESC, COALESCE(shares,0) DESC LIMIT 5').all();

    return Response.json({
      totalProducts: Number(totalProducts?.total || 0),
      addedToday: Number(addedToday?.total || 0),
      addedWeek: Number(addedWeek?.total || 0),
      totalShops: Number(totalShops?.total || 0),
      shopsWeek: Number(shopsWeek?.total || 0),
      fullShops: Number(fullShops?.total || 0),
      viewsToday: Number(viewsToday?.total || 0),
      ordersToday: Number(ordersToday?.total || 0),
      topProducts: topProducts.results || [],
      productMetrics
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to load stats.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
