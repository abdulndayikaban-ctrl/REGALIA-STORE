/* ====== SHARED PRODUCT LOADER & UTILITIES ======
   Expects Google Sheet published as CSV. The sheet header may be:
   name,image,normalPrice,salePrice,description,features,category,color_images
   color_images (optional) should be: color1|url1;color2|url2;...
   Example row:
   "Base Hoodie","https://.../hoodie.png","450","400","240gsm Brushed Fleece...","Cotton | 40% Polyester",Apparel,"brown|https://.../brown.png;black|https://.../black.png"
=================================================*/

let SHARED_CONFIG = { sheetUrl: null, cached: null };

async function initShared(config = {}) {
  if (config.sheetUrl) SHARED_CONFIG.sheetUrl = config.sheetUrl;
  if (!SHARED_CONFIG.sheetUrl) {
    console.error('No sheetUrl configured. Call initShared({sheetUrl: "..."}) first.');
  }
  // preload small assets if needed (logo fallback)
}

async function fetchProducts() {
  if (!SHARED_CONFIG.sheetUrl) {
    console.error('fetchProducts called before initShared() with sheetUrl.');
    return [];
  }
  // cache for this session
  if (SHARED_CONFIG.cached) return SHARED_CONFIG.cached;

  try {
    const res = await fetch(SHARED_CONFIG.sheetUrl + '&cacheBust=' + Date.now());
    const text = await res.text();
    const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    if (rows.length <= 1) return [];

    // detect header and map columns by name
    const header = rows.shift();
    const headerCols = splitCsvRow(header).map(h => h.toLowerCase().trim());

    const data = rows.map(row => {
      const cols = splitCsvRow(row);
      const obj = {};
      headerCols.forEach((colName, i) => {
        obj[colName] = (cols[i] || '').replace(/^"|"$/g, '').trim();
      });
      // normalize field names
      const product = {
        name: obj.name || obj.title || '',
        image: obj.image || obj.img || '',
        normalPrice: obj['normal price'] || obj.normalprice || obj.price || '',
        salePrice: obj['sale price'] || obj.saleprice || '',
        description: obj.description || '',
        features: obj.features || '',
        category: obj.category || '',
        rawColorImages: obj['color_images'] || obj['color images'] || obj.color_images || ''
      };
      // parse color images if present: format color|url;color2|url2
      product.colorImages = [];
      if (product.rawColorImages) {
        product.rawColorImages.split(';').map(s => s.trim()).filter(Boolean).forEach(pair => {
          const [color, url] = pair.split('|').map(x => x && x.trim());
          if (url) product.colorImages.push({ color: color || '', url });
        });
      }
      return product;
    });

    SHARED_CONFIG.cached = data;
    return data;
  } catch (e) {
    console.error('Error fetching products:', e);
    return [];
  }
}

// Robust CSV row splitter that respects quoted commas
function splitCsvRow(row) {
  // split on commas not inside quotes
  return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g,'').trim());
}

/* Optional small helper: preload images for a product */
function preloadImages(product) {
  const urls = [];
  if (product.image) urls.push(product.image);
  (product.colorImages || []).forEach(ci => urls.push(ci.url));
  urls.forEach(u => { const i = new Image(); i.src = u; });
}

/* Expose functions for pages */
window.initShared = initShared;
window.fetchProducts = fetchProducts;
window.splitCsvRow = splitCsvRow;
window.preloadImages = preloadImages;
