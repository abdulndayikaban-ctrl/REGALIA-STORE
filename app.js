// MASTER STRUCTURE
const SHOPS = [
  {shopId:"regalia_main", name:"REGALIA STYLE - Main Shop", owner:"Abdul", logo:"R", desc:"ANC Clothing & Custom Wear - East London", location:"East London, Eastern Cape"}
];

let state = {view:"cats", cat:null, shop:null, sub:null};

const CATS = {
  BUY: {title:"1. BUY", sub:["Custom My Cloth", "Buy Regalia - ANC Clothing"]},
  SELL: {title:"2. SELL", sub:["Rent Shop With Products", "Own Products - Upload PDF"]},
  SERVICES: {title:"3. SERVICES", sub:["Embroidery", "DTF Printing", "Sublimation"]},
  PLAINS: {title:"4. PLAINS / BLANKS", sub:["Buy Blanks", "Customize Blanks", "Custom Sublimation"]}
};

function goHome(){state={view:"cats",cat:null,shop:null,sub:null};render();}
function render(){
  const bc=document.getElementById('breadcrumb');
  const ct=document.getElementById('content');
  let html="", crumb=`<span onclick="goHome()">Home</span>`;

  if(state.view==="cats"){
    bc.innerHTML="Home > Categories";
    html=Object.keys(CATS).map(k=>`<div class="card" onclick="openCat('${k}')"><h2>${CATS[k].title}</h2><p>Click to enter</p></div>`).join('');
  }
  else if(state.view==="shops"){
    crumb+=` > <span onclick="openCat('${state.cat}')">${CATS[state.cat].title}</span> > Shops`;
    bc.innerHTML=crumb;
    html=SHOPS.map(s=>`<div class="card" onclick="openShop('${s.shopId}')"><div class="shop-logo">${s.logo}</div><h3>${s.name}</h3><small>${s.desc}</small><br><small>${s.location}</small></div>`).join('');
    if(SHOPS.length===0) html="<p>No shops rented yet - Only main shop</p>";
  }
  else if(state.view==="shopOptions"){
    crumb+=` > <span onclick="openCat('${state.cat}')">${CATS[state.cat].title}</span> > <span onclick="openShop('${state.shop.shopId}')">${state.shop.name}</span>`;
    bc.innerHTML=crumb;
    const shop=state.shop;
    html=`<div style="grid-column:1/-1;background:#222;padding:15px;border:1px solid gold"><div class="shop-logo">${shop.logo}</div><h2>${shop.name}</h2><p>${shop.desc} | Owner: ${shop.owner}</p></div>`;
    html+=CATS[state.cat].sub.map((sub,i)=>`<div class="card" onclick="openSub('${sub}')"><h3>${sub}</h3><p>Enter ${sub}</p></div>`).join('');
  }
  else if(state.view==="products"){
    crumb+=` > <span onclick="openCat('${state.cat}')">${CATS[state.cat].title}</span> > <span onclick="openShop('${state.shop.shopId}')">${state.shop.name}</span> > ${state.sub}`;
    bc.innerHTML=crumb;
    html=`<div style="grid-column:1/-1"><button class="btn" onclick="goBackToOptions()">← Back to Options</button><h2>${state.shop.name} - ${state.sub}</h2>`;
    if(state.cat==="BUY" && state.sub.includes("Buy Regalia")){
      html+=`<p>All ANC clothing products will show here - normal website view. This is our main work. Ready for scraper.</p>`;
      html+=`<div id="products">Loading products.json...</div>`;
    } else {
      html+=`<p>Structure ready for ${state.sub}. Later we build this page.</p>`;
    }
    html+=`</div>`;
  }
  ct.innerHTML=html;
  if(state.view==="products" && state.cat==="BUY" && state.sub.includes("Buy Regalia")){
    loadProducts();
  }
}

function openCat(cat){state={view:"shops",cat:cat,shop:null,sub:null};render();}
function openShop(shopId){const shop=SHOPS.find(s=>s.shopId===shopId);state.view="shopOptions";state.shop=shop;render();}
function openSub(sub){state.view="products";state.sub=sub;render();}
function goBackToOptions(){state.view="shopOptions";render();}

function loadProducts(){
  fetch('products.json').then(r=>r.json()).then(d=>{
    const list=d.products||[];
    const div=document.getElementById('products');
    if(!div) return;
    if(list.length===0) div.innerHTML="No products yet - scraper will fill BUY > Buy Regalia";
    else div.innerHTML=`<div class="grid">${list.map(p=>`<div class="card"><img src="${p.image}" onerror="this.src='https://via.placeholder.com/200'"><h4>${p.name}</h4><p>R${p.price_50||p.price}</p><small>${p.category}</small></div>`).join('')}</div>`;
  });
}
render();