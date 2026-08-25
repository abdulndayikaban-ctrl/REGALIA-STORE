const SHOPS = [
  {shopId:"anc_regalia", name:"ANC REGALIA STYLE", owner:"Abdul Divad Kabika", logo:"ANC", location:"East London, EC", phone:"277...", desc:"Main Shop - ANC Clothing & Regalia"}
];

const PRODUCTS = [
  {id:"p1", name:"ANC Cap - Yellow", image:"https://via.placeholder.com/300?text=ANC+Cap", price:250, category:"BUY", sub:"Headwear", shopId:"anc_regalia", fabric:"100% Cotton Twill, 6 panel, Embroidered logo"},
  {id:"p2", name:"ANC Hoodie Black", image:"https://via.placeholder.com/300?text=Hoodie", price:550, category:"BUY", sub:"Hoodies", shopId:"anc_regalia", fabric:"Fleece 240gsm, Brushed inside, DTF front"},
  {id:"p3", name:"Golf Shirt - Green", image:"https://via.placeholder.com/300?text=Golf+Shirt", price:450, category:"BUY", sub:"Apparel", shopId:"anc_regalia", fabric:"Pique Golf 180gsm, Collar, Sublimation ready"},
  {id:"p4", name:"ANC Jacket", image:"https://via.placeholder.com/300?text=Jacket", price:750, category:"BUY", sub:"Jackets", shopId:"anc_regalia", fabric:"Softshell, Water resistant, Embroidery chest"},
  {id:"p5", name:"Round Neck - DTF", image:"https://via.placeholder.com/300?text=Round+Neck", price:300, category:"BUY", sub:"Apparel", shopId:"anc_regalia", fabric:"Cotton 160gsm, DTF 28x28cm"},
  {id:"p6", name:"Plain Blank - Black", image:"https://via.placeholder.com/300?text=Plain+Blank", price:120, category:"PLAINS", sub:"T-Shirts", shopId:"anc_regalia", fabric:"Captivity Plain - 100% Cotton"},
];

let state = {view:"BUY", filter:"All", selected:null, rentStep:"options", branding:"options"};

function go(view){
  state.view=view;
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  document.getElementById('btn-'+view)?.classList.add('active');
  render();
}

function render(){
  const bc=document.getElementById('breadcrumb');
  const ct=document.getElementById('content');
  bc.innerHTML=`Home > ${state.view}`;
  if(state.view==="BUY") renderBuy(ct);
  if(state.view==="PLAINS") renderPlains(ct);
  if(state.view==="RENT") renderRent(ct);
  if(state.view==="BRANDING") renderBranding(ct);
  if(state.view==="PRODUCT") renderProduct(ct);
}

function renderBuy(ct){
  const subs=["All","Headwear","Apparel","Jackets","Hoodies","Caps"];
  let html=`<div class="toggle">${subs.map(s=>`<button class="${state.filter===s?'active':''}" onclick="setFilter('${s}')">${s}</button>`).join('')}</div>`;
  let list = PRODUCTS.filter(p=>p.category==="BUY");
  if(state.filter!=="All") list=list.filter(p=>p.sub===state.filter);
  html+=`<div class="grid">${list.map(p=>`
    <div class="card" onclick="openProduct('${p.id}')">
      <img src="${p.image}">
      <h4>${p.name}</h4>
      <p style="color:gold">R${p.price}</p>
      <span class="shop-badge">${SHOPS.find(s=>s.shopId===p.shopId)?.name||'ANC'}</span>
    </div>`).join('')}</div>`;
  ct.innerHTML=html;
}

function renderPlains(ct){
  let list=PRODUCTS.filter(p=>p.category==="PLAINS");
  ct.innerHTML=`<div style="padding:15px"><h2>BUY PLAINS - Captivity Blanks (Scraper will fill here)</h2><p>All blanks mixed, same as BUY but from Captivity</p></div><div class="grid">${list.map(p=>`
    <div class="card" onclick="openProduct('${p.id}')">
      <img src="${p.image}"><h4>${p.name}</h4><p style="color:gold">R${p.price} + 50%</p>
      <span class="shop-badge">Captivity Blank</span>
    </div>`).join('')}</div>`;
}

function openProduct(id){
  state.selected=PRODUCTS.find(p=>p.id===id);
  state.view="PRODUCT";
  render();
}

function renderProduct(ct){
  const p=state.selected;
  const shop=SHOPS.find(s=>s.shopId===p.shopId);
  ct.innerHTML=`
    <div style="padding:15px;max-width:900px;margin:auto">
      <button class="btn2" onclick="go('BUY')">← Back to All Products</button>
      <div class="shop-top" onclick="alert('Shop Profile:\\n${shop.name}\\nOwner: ${shop.owner}\\nLocation: ${shop.location}\\nPhone: ${shop.phone}\\n\\nVerification: Verified\\nShop Size: 36 items')">
        <div class="logo-circle">${shop.logo}</div>
        <div><strong>${shop.name}</strong><br><small>${shop.location} - Tap for profile</small></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:20px;background:#1a1a1a;padding:20px;border-radius:8px">
        <img src="${p.image}" style="width:320px;height:320px;object-fit:contain;background:#fff;border-radius:6px">
        <div style="flex:1">
          <h2>${p.name}</h2>
          <h3 style="color:gold;margin:10px 0">R${p.price}</h3>
          <p>Category: ${p.sub}</p>
          <br>
          <button class="btn2" onclick="alert('Added to Cart - upgrade later')">Add to Cart</button>
          <button class="btn" onclick="buyNow()">Buy Now → WhatsApp</button>
          <hr style="margin:20px 0;border:0;border-top:1px solid #333">
          <h4>Fabric / Features</h4>
          <p style="color:#aaa;margin-top:8px;line-height:1.5">${p.fabric}</p>
          <ul style="color:#aaa;margin:10px 0 0 20px">
            <li>Sizes: S, M, L, XL, 2XL, 3XL</li>
            <li>Wash: Cold, Do not bleach</li>
            <li>Delivery: East London + Courier</li>
          </ul>
        </div>
      </div>
    </div>`;
}

function buyNow(){
  const p=state.selected;
  const shop=SHOPS.find(s=>s.shopId===p.shopId);
  const msg=`Hi, I want to order:%0AProduct: ${p.name}%0APrice: R${p.price}%0AShop: ${shop.name}%0ALocation: ${shop.location}%0AFabric: ${p.fabric}`;
  window.open(`https://wa.me/27700000000?text=${msg}`,'_blank');
}

function setFilter(f){state.filter=f;render();}

function renderRent(ct){
  if(state.rentStep==="options"){
    ct.innerHTML=`
      <div style="padding:20px">
        <h2>RENT SHOP - Create Your Shop</h2>
        <div class="grid" style="margin-top:20px">
          <div class="card" onclick="rentOption('have')"><h3>I have products</h3><p>You have your own stock. Register shop + verification + choose size 9,18,36,72,81</p></div>
          <div class="card" onclick="rentOption('nohave')"><h3>I don't have products</h3><p>We supply from Captivity blanks. Still create profile + shop size</p></div>
        </div>
      </div>`;
  } else if(state.rentStep==="form"){
    ct.innerHTML=`
      <div style="padding:20px">
        <button class="btn2" onclick="state.rentStep='options';render()">← Back</button>
        <h2>Register Shop Profile - ${state.rentHave==='have'?'I have products':'I don\\'t have products'}</h2>
        <div class="form-box" style="margin-top:15px">
          <input placeholder="Shop Name (e.g ANC REGALIA STYLE)">
          <input placeholder="Owner Name">
          <input placeholder="Phone (WhatsApp)">
          <input placeholder="Location">
          <input placeholder="Logo URL or upload later">
          <label><input type="checkbox"> ID Verification</label><br>
          <label><input type="checkbox"> Business Registration (optional)</label><br><br>
          <p>Choose Shop Size (items you can list):</p>
          <div id="sizes">${[9,18,36,72,81].map(n=>`<span class="size-opt" onclick="pickSize(${n})" id="size-${n}">${n} items</span>`).join('')}</div>
          <br><br>
          <button class="btn" onclick="createShop()">Create Shop</button>
        </div>
      </div>`;
  } else {
    ct.innerHTML=`<div style="padding:40px;text-align:center"><h1 style="color:gold">✓ Shop Successfully Created!</h1><p style="margin:15px">Your shop is now live in BUY - mall view</p><button class="btn" onclick="state.rentStep='options';go('BUY')">Go to BUY - See your shop</button></div>`;
  }
}

function rentOption(h){state.rentHave=h;state.rentStep='form';render();}
function pickSize(n){
  document.querySelectorAll('.size-opt').forEach(e=>e.classList.remove('active'));
  document.getElementById('size-'+n).classList.add('active');
  state.pickedSize=n;
}
function createShop(){
  if(!state.pickedSize) return alert('Pick shop size: 9,18,36,72,81');
  state.rentStep='success';
  render();
}

function renderBranding(ct){
  if(state.branding==="options"){
    ct.innerHTML=`
      <div style="padding:20px">
        <h2>BRANDING - 4 Services</h2>
        <div class="grid" style="margin-top:20px">
          <div class="card" onclick="openBrand('embroidery')"><h3>Embroidery</h3><p>Drop off / Collect / Courier + logo + setup fee</p></div>
          <div class="card" onclick="openBrand('dtf')"><h3>DTF Printing</h3><p>Width 58cm x meters, artwork upload</p></div>
          <div class="card" onclick="openBrand('sub')"><h3>Sublimation</h3><p>Width 145cm x meters</p></div>
          <div class="card" onclick="openBrand('outdoors')"><h3>Outdoors</h3><p>Banners, Flags, Gazebo etc</p></div>
        </div>
      </div>`;
  } else {
    let html=`<div style="padding:20px"><button class="btn2" onclick="state.branding='options';render()">← Back</button>`;
    if(state.branding==='embroidery'){
      html+=`<h2>Embroidery Order</h2><div class="form-box" style="margin-top:15px">
        <select><option>Drop off</option><option>Collect</option><option>Courier</option></select>
        <input placeholder="Upload Logo PNG / PDF - Is this first time? (setup fee)">
        <textarea placeholder="Position: cut paper + needle where logo should be + size cm"></textarea>
        <input placeholder="Quantity">
        <button class="btn" onclick="alert('Embroidery order sent to WhatsApp')">Send to WhatsApp</button>
      </div>`;
    }
    if(state.branding==='dtf'){
      html+=`<h2>DTF Printing - Width 58cm</h2><div class="form-box" style="margin-top:15px">
        <select id="art" onchange="toggleArt()"><option value="yes">I have artwork</option><option value="no">Require Graphic Design</option></select>
        <div id="art-yes"><input placeholder="Upload PDF / PNG - Width 58cm, length in meters"><input placeholder="Length meters required"></div>
        <div id="art-no" style="display:none"><textarea placeholder="Describe design needed"></textarea></div>
        <button class="btn" onclick="alert('DTF order sent')">Send to WhatsApp</button>
      </div>`;
    }
    if(state.branding==='sub'){
      html+=`<h2>Sublimation - Width 145cm</h2><div class="form-box" style="margin-top:15px">
        <select><option>I have artwork</option><option>Require Graphic Design</option></select>
        <input placeholder="Upload PDF / PNG - Width 145cm x meters">
        <input placeholder="Length meters">
        <button class="btn" onclick="alert('Sublimation order sent')">Send to WhatsApp</button>
      </div>`;
    }
    if(state.branding==='outdoors'){
      html+=`<h2>Outdoors - Products & Categories</h2><div class="grid" style="margin-top:15px">
        <div class="card"><img src="https://via.placeholder.com/200?text=Banner"><h4>Banners</h4></div>
        <div class="card"><img src="https://via.placeholder.com/200?text=Flag"><h4>Flags</h4></div>
        <div class="card"><img src="https://via.placeholder.com/200?text=Gazebo"><h4>Gazebo</h4></div>
        <div class="card"><img src="https://via.placeholder.com/200?text=Board"><h4>Boards</h4></div>
      </div>`;
    }
    html+=`</div>`;
    ct.innerHTML=html;
  }
}

function openBrand(b){state.branding=b;render();}
function toggleArt(){
  const v=document.getElementById('art').value;
  document.getElementById('art-yes').style.display=v==='yes'?'block':'none';
  document.getElementById('art-no').style.display=v==='no'?'block':'none';
}

render();
