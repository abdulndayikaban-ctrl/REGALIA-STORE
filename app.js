// ANC REGALIA MALL - Fixed structure per your request
const SHOPS = [
  {shopId:"anc_regalia", name:"ANC REGALIA STYLE", owner:"Abdul", logo:"ANC", desc:"ANC Clothing - Main Shop", location:"East London"}
];

let state = {view:"cats", cat:null, sub:null};

const CATS = {
  BUY: {title:"1. BUY", type:"direct_products", shopId:"anc_regalia"},
  SELL: {title:"2. SELL", type:"options", options:["Own Products - Upload PDF (Profile Edit)", "Rent Shop With Existing Products (Choose/Random Designs)"]},
  SERVICES: {title:"3. SERVICES", type:"options", options:["Embroidery", "DTF Printing", "Sublimation"]},
  PLAINS: {title:"4. PLAINS / BLANKS", type:"direct_products", shopId:"blanks", note:"Gets blanks from Captivity"}
};

function goHome(){state={view:"cats",cat:null,sub:null};render();}

function render(){
  const bc=document.getElementById('breadcrumb');
  const ct=document.getElementById('content');
  let crumb=`<span onclick="goHome()">Home</span>`;

  if(state.view==="cats"){
    bc.innerHTML="Home > Categories";
    ct.innerHTML=Object.keys(CATS).map(k=>`<div class="card" onclick="openCat('${k}')"><h2>${CATS[k].title}</h2><p>${k==='BUY'?'ANC Products Direct':k==='SELL'?'2 options':k==='SERVICES'?'3 services':'Blanks from Captivity'}</p></div>`).join('');
  }
  else if(state.view==="options"){
    crumb+=` > <span onclick="openCat('${state.cat}')">${CATS[state.cat].title}</span>`;
    bc.innerHTML=crumb;
    const opts=CATS[state.cat].options;
    let html=`<div style="grid-column:1/-1"><button class="btn" onclick="goHome()">← Back</button><h2>${CATS[state.cat].title}</h2></div>`;
    html+=opts.map(o=>`<div class="card" onclick="openSub('${o}')"><h3>${o}</h3><p>Click to ${o.includes('Own')?'Edit Profile & Upload PDF':o.includes('Rent')?'Choose designs or random':'Enter service'}</p></div>`).join('');
    ct.innerHTML=html;
  }
  else if(state.view==="products"){
    crumb+=` > ${CATS[state.cat].title}`;
    if(state.sub) crumb+=` > ${state.sub}`;
    bc.innerHTML=crumb;
    let title = state.cat==="BUY" ? "ANC REGALIA STYLE - All ANC Products" : state.cat==="PLAINS" ? "BLANKS - From Captivity" : state.sub;
    let html=`<div style="grid-column:1/-1"><button class="btn" onclick="goBack()">← Back</button><h2>${title}</h2>`;
    
    if(state.cat==="BUY"){
      html+=`<p>Main work - ANC clothing, normal website view. Scraper will fill here.</p><div id="products">Loading...</div>`;
    } else if(state.cat==="PLAINS"){
      html+=`<p>Plain blanks direct from Captivity - ready for branding.</p><div id="products">Loading blanks...</div>`;
    } else if(state.cat==="SELL" && state.sub && state.sub.includes("Own Products")){
      html+=`<div style="background:#222;padding:20px;border:1px solid gold"><h3>Profile Edit - Mall Template</h3><p>Here you will edit shop profile like original but different details, then upload product PDF. Platform will convert PDF to look same as other products in platform.</p><input placeholder="Shop Name" style="width:90%;padding:10px;margin:5px"><br><input placeholder="Owner" style="width:90%;padding:10px;margin:5px"><br><button class="btn">Save Profile Template</button></div>`;
    } else if(state.cat==="SELL" && state.sub && state.sub.includes("Rent Shop")){
      html+=`<div style="background:#222;padding:20px;border:1px solid gold"><h3>Choose Designs for Rented Shop</h3><button class="btn">Choose Designs Manually</button><button class="btn">Pick Randomly From Captivity</button><p>Mall will assign products to rented shop profile.</p></div>`;
    } else if(state.cat==="SERVICES"){
      html+=`<p>Service: ${state.sub} - Details and pricing will show here.</p>`;
    }
    html+=`</div>`;
    ct.innerHTML=html;
    if((state.cat==="BUY"||state.cat==="PLAINS") && document.getElementById('products')) loadProducts();
  }
}

function openCat(cat){
  state.cat=cat;
  const c=CATS[cat];
  if(c.type==="direct_products"){state.view="products";state.sub=null;}
  else {state.view="options";}
  render();
}
function openSub(sub){state.view="products";state.sub=sub;render();}
function goBack(){
  const c=CATS[state.cat];
  if(c.type==="options" && state.view==="products"){state.view="options";state.sub=null;}
  else goHome();
  render();
}
function loadProducts(){
  fetch('products.json').then(r=>r.json()).then(d=>{
    const div=document.getElementById('products');
    if(!div) return;
    let list=d.products.filter(p=>p.category===state.cat);
    if(list.length===0) div.innerHTML=`No products yet in ${state.cat} - scraper will fill`;
    else div.innerHTML=`<div class="grid">${list.map(p=>`<div class="card"><img src="${p.image}" onerror="this.src='https://via.placeholder.com/200'"><h4>${p.name}</h4><p>R${p.price_50||p.price}</p></div>`).join('')}</div>`;
  });
}
render();