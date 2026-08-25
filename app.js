// FINAL BUY = All products mall view, shop shown on product click
const SHOPS = [
  {shopId:"anc_regalia", name:"ANC REGALIA STYLE", owner:"Abdul Divad Kabika", logo:"ANC", desc:"Main Shop - ANC Clothing", location:"East London, Eastern Cape"}
];

let state = {view:"cats", cat:null, sub:null, selectedProduct:null};

const CATS = {
  BUY: {title:"1. BUY", type:"all_products"},
  SELL: {title:"2. SELL", type:"options", options:["Own Products - Upload PDF (Profile Edit)", "Rent Shop With Existing Products (Choose/Random Designs)"]},
  SERVICES: {title:"3. SERVICES", type:"options", options:["Embroidery", "DTF Printing", "Sublimation"]},
  PLAINS: {title:"4. PLAINS / BLANKS", type:"all_products"}
};

function goHome(){state={view:"cats",cat:null,sub:null,selectedProduct:null};render();}

function render(){
  const bc=document.getElementById('breadcrumb');
  const ct=document.getElementById('content');
  let crumb=`<span onclick="goHome()">Home</span>`;

  if(state.view==="cats"){
    bc.innerHTML="Home > Categories";
    ct.innerHTML=Object.keys(CATS).map(k=>`<div class="card" onclick="openCat('${k}')"><h2>${CATS[k].title}</h2><p>${k==='BUY'?'All products mixed - mall view':k==='SELL'?'Rent shop / Own products':k==='SERVICES'?'3 services':'Blanks from Captivity'}</p></div>`).join('');
  }
  else if(state.view==="options"){
    crumb+=` > <span onclick="openCat('${state.cat}')">${CATS[state.cat].title}</span>`;
    bc.innerHTML=crumb;
    const opts=CATS[state.cat].options;
    let html=`<div style="grid-column:1/-1"><button class="btn" onclick="goHome()">← Back</button><h2>${CATS[state.cat].title}</h2></div>`;
    html+=opts.map(o=>`<div class="card" onclick="openSub('${o}')"><h3>${o}</h3></div>`).join('');
    ct.innerHTML=html;
  }
  else if(state.view==="products"){
    crumb+=` > ${CATS[state.cat].title}`;
    bc.innerHTML=crumb;
    let title = state.cat==="BUY"? "ALL PRODUCTS - Mall View (All Shops Mixed)" : "BLANKS - All Blanks Mixed";
    let html=`<div style="grid-column:1/-1"><button class="btn" onclick="goHome()">← Back to Categories</button><h2>${title}</h2><p>All products appear at once. Click product to see shop & owner.</p><button class="btn" onclick="showAddForm()">+ Add Product Manually</button><div id="addForm" style="display:none;background:#222;padding:15px;margin:15px 0;border:1px solid gold"><h3>Add Product to ANC REGALIA STYLE</h3><input id="pName" placeholder="Product Name" style="width:90%;padding:8px;margin:5px"><br><input id="pPrice" type="number" placeholder="Price (cost - we add 50%)" style="width:90%;padding:8px;margin:5px"><br><input id="pImage" placeholder="Image URL" style="width:90%;padding:8px;margin:5px"><br><button class="btn" onclick="addProduct()">Save to products.json (Manual)</button><p style="color:gold">After save, copy text and paste into products.json then push</p><pre id="pOutput" style="background:#000;color:#0f0;padding:10px;white-space:pre-wrap"></pre></div><div id="products">Loading...</div></div>`;
    ct.innerHTML=html;
    loadProducts();
  }
  else if(state.view==="productDetail"){
    const p=state.selectedProduct;
    const shop=SHOPS.find(s=>s.shopId===p.shopId) || {name:"Unknown Shop", owner:"Unknown"};
    crumb+=` > ${state.cat} > ${p.name}`;
    bc.innerHTML=crumb;
    ct.innerHTML=`<div style="grid-column:1/-1;background:#222;padding:20px;border:2px solid gold"><button class="btn" onclick="backToProducts()">← Back to All Products</button><div style="display:flex;flex-wrap:wrap;gap:20px"><img src="${p.image}" style="width:300px;height:300px;object-fit:contain;background:#fff"><div><h2>${p.name}</h2><h3 style="color:gold">R${p.price_50||p.price}</h3><p>Cost: R${p.price} | Sell: R${p.price_50}</p><hr><div style="background:#111;padding:15px;border:1px solid gold"><div class="shop-logo" style="width:60px;height:60px;font-size:20px">${shop.logo}</div><h4>Shop: ${shop.name}</h4><p>Owner: ${shop.owner}</p><p>Location: ${shop.location}</p><p>${shop.desc}</p></div><br><button class="btn">Add to Cart</button><button class="btn">Contact Owner</button></div></div></div>`;
  }
}

function openCat(cat){state.cat=cat;const c=CATS[cat];if(c.type==="all_products"){state.view="products";}else{state.view="options";}render();}
function openSub(sub){state.view="products";state.sub=sub;render();}
function backToProducts(){state.view="products";state.selectedProduct=null;render();}

function loadProducts(){
  fetch('products.json').then(r=>r.json()).then(d=>{
    const div=document.getElementById('products');
    if(!div) return;
    let list=d.products.filter(p=>p.category===state.cat);
    if(list.length===0) div.innerHTML=`No products yet - add manually or scraper`;
    else div.innerHTML=`<div class="grid">${list.map(p=>{const shop=SHOPS.find(s=>s.shopId===p.shopId);return `<div class="card" onclick="viewProduct('${p.id}')"><img src="${p.image}" onerror="this.src='https://via.placeholder.com/200'"><h4>${p.name}</h4><p>R${p.price_50||p.price}</p><small style="background:gold;color:#000;padding:2px 6px;border-radius:3px">${shop?shop.name:'ANC REGALIA STYLE'}</small></div>`}).join('')}</div>`;
    // store for lookup
    window._allProducts=d.products;
  });
}
function viewProduct(id){
  const p=window._allProducts.find(x=>x.id===id);
  if(!p) return;
  state.selectedProduct=p;
  state.view="productDetail";
  render();
}
function showAddForm(){const f=document.getElementById('addForm');f.style.display=f.style.display==='none'?'block':'none';}
function addProduct(){
  const name=document.getElementById('pName').value;
  const price=parseFloat(document.getElementById('pPrice').value)||0;
  const image=document.getElementById('pImage').value||"https://via.placeholder.com/300?text=ANC";
  const price50=Math.round(price*1.5);
  const obj={
    id:"anc-"+Date.now(),
    name:name,
    image:image,
    price:price,
    price_50:price50,
    category:state.cat,
    subCategory:"Manual Add",
    shopId:"anc_regalia",
    status:"manual"
  };
  document.getElementById('pOutput').textContent=JSON.stringify(obj,null,2)+",\n// Copy this object into products.json -> products array";
}

render();