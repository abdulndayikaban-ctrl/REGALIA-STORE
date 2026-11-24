var editIndex=-1;
var _R2Products=[];function getProducts(){return _R2Products}
function saveProducts(list){_R2Products=list;return fetch("https://regalia-upload.abdulndayi-kab-an.workers.dev/products.json?shopId="+(localStorage.getItem('regaliaShopId')||'regalia'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(list)})}
function loadProductsFromR2(){fetch("https://regalia-upload.abdulndayi-kab-an.workers.dev/products.json?shopId="+(localStorage.getItem('regaliaShopId')||'regalia')).then(function(r){return r.json()}).then(function(d){_R2Products=Array.isArray(d)?d:(d.products||[]);renderProducts()}).catch(function(){renderProducts()})}
function renderProducts(){if(!window._R2Loaded){window._R2Loaded=true;loadProductsFromR2();return}
  try{
    var box=document.getElementById('view-prod');if(!box){return}
    var list=getProducts();
    var q=(document.getElementById('prodSearch')?document.getElementById('prodSearch').value.toLowerCase():'');
    var html='<h2>PROD - Your Products</h2><p style="color:#9ba8b6">'+list.length+' real products</p>';
    html+='<input id="prodSearch" value="'+q+'" oninput="renderProducts()" placeholder="Search product..." style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:12px">';
    html+='<input id="prodName" placeholder="Product name - e.g. RS CAP" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px">';
    html+='<input id="prodPrice" placeholder="Price - e.g. 150" type="number" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px">';
    html+='<select id="prodCat" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px"><option>Cap</option><option>Shirt</option><option>Hoodie</option><option>Pants</option><option>Shoes</option><option>Other</option></select>';
    html+='<input id="prodStock" placeholder="Stock - e.g. 10" type="number" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px">';
    html+='<input id="prodDesc" placeholder="Description - e.g. Black RS Cap, one size" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px">';
    html+='<p style="color:#9ba8b6">Photo</p><input id="prodPhoto" type="file" accept="image/*" style="width:100%;margin-bottom:8px;color:#f3f5f8">';
    html+='<button onclick="addProduct()" style="background:#d4af37;color:#0b0d12;border:0;border-radius:999px;padding:12px 22px;font-weight:800;font-size:16px">'+(editIndex>=0?'SAVE Edit':'SAVE Product')+'</button>';
    if(editIndex>=0){html+=' <button onclick="cancelEdit()" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:12px 18px">Cancel</button>'}
    html+='<div id="prodList" style="margin-top:14px"></div>';
    box.innerHTML=html;
    if(q){document.getElementById('prodSearch').focus();document.getElementById('prodSearch').setSelectionRange(q.length,q.length)}
    var listEl=document.getElementById('prodList');
       var shown=list.filter(function(p){return !q||(p.name||'').toLowerCase().indexOf(q)>=0});
    if(shown.length===0){listEl.innerHTML='<p style="color:#9ba8b6">No products found. Add your first real product.</p>';return}
    shown.forEach(function(p){
      var realIdx=list.indexOf(p);
      var d=document.createElement('div');
      d.style.cssText='background:#141922;border:1px solid #333;border-radius:12px;padding:12px;margin-bottom:10px;display:flex;gap:12px';
            var photo=p.photo?'<img src="'+p.photo+'" style="width:70px;height:70px;object-fit:cover;border-radius:10px">':'<div style="width:70px;height:70px;background:#d4af37;color:#0b0d12;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px">'+((p.name||'R').charAt(0)||'R')+'</div>';
      var stockTxt=p.stock!==undefined?('Stock: '+p.stock+(p.stock<=3?' - Only '+p.stock+' left':' - In stock')):'';
      var liveTxt=(p.status||(p.live===false?'Draft':'Live'))+(p.featured?' ★ Featured':'');
      d.innerHTML=photo+'<div style="flex:1"><b style="color:#f3f5f8">'+p.name+'</b> <span style="color:#d4af37">R'+p.price+'</span> <span style="background:#d4af37;color:#0b0d12;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:800">'+liveTxt+'</span><br><span style="color:#9ba8b6">'+(p.cat||'Cap')+' - '+(p.desc||'')+'</span><br><span style="color:#9ba8b6;font-size:13px">'+stockTxt+'</span><br><button onclick="toggleLive('+realIdx+')" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:6px 12px;margin-top:8px">Change Status</button> <button onclick="toggleFeatured('+realIdx+')" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:6px 12px;margin-top:8px">★ Feature</button> <button onclick="editProduct('+realIdx+')" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:6px 12px;margin-top:8px">Edit</button> <button onclick="buyProduct('+realIdx+')" style="background:#d4af37;color:#0b0d12;border:0;border-radius:999px;padding:6px 12px;margin-top:8px;font-weight:800">Buy on WhatsApp</button> <button onclick="deleteProduct('+realIdx+')" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:6px 12px;margin-top:8px">Delete</button></div>';
      listEl.appendChild(d);
    });
  }catch(e){alert('PROD error: '+e.message)}
}
function readPhoto(cb){
try{
var f=document.getElementById('prodPhoto');if(!f||!f.files||!f.files[0]){cb('');return}
var file=f.files[0];var nm=file.name.toLowerCase();
if(nm.endsWith('.html')||nm.endsWith('.htm')||nm.endsWith('.js')||nm.endsWith('.svg')||nm.endsWith('.php')){alert('That file type is not allowed. Use JPG or PNG photo only.');f.value='';cb('');return}
if(!file.type.startsWith('image/')){alert('Choose a photo image only.');f.value='';cb('');return}
if(file.size>10*1024*1024){alert('Photo too big. Max 10MB.');f.value='';cb('');return}
var img=new Image();var url=URL.createObjectURL(file);
img.onload=function(){try{var maxW=1200;var w=img.naturalWidth;var h=img.naturalHeight;var s=Math.min(1,maxW/w);var nw=Math.round(w*s);var nh=Math.round(h*s);var c=document.createElement('canvas');c.width=nw;c.height=nh;var ctx=c.getContext('2d');ctx.drawImage(img,0,0,nw,nh);URL.revokeObjectURL(url);c.toBlob(async function(blob){try{var shopId=localStorage.getItem('regaliaShopId')||'regalia';var res=await fetch("https://regalia-upload.abdulndayi-kab-an.workers.dev/upload?shopId="+shopId,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});var j=await res.json();if(j.ok&&j.key){cb("https://regalia-upload.abdulndayi-kab-an.workers.dev/image/"+j.key)}else{cb(c.toDataURL('image/jpeg',0.75))}}catch(e){cb(c.toDataURL('image/jpeg',0.75))}},'image/jpeg',0.75)}catch(e){cb('')}};}catch(e){cb('')}};
img.onerror=function(){URL.revokeObjectURL(url);alert('Could not read photo. Use JPG or PNG.');cb('')};
img.src=url;
}catch(e){cb('')}
}
function addProduct(){
  try{
    var n=document.getElementById('prodName');if(!n||!n.value.trim()){alert('Type product name first');return}
    var pr=document.getElementById('prodPrice');var cat=document.getElementById('prodCat');var st=document.getElementById('prodStock');var ds=document.getElementById('prodDesc');
    readPhoto(function(photo){
      var list=getProducts();
      var cleanName=n.value.trim().replace(/[<>"']/g,'');var cleanDesc=(ds?ds.value:'').replace(/[<>"']/g,'');var item={id:'p'+Date.now()+Math.floor(Math.random()*1000),name:cleanName,price:Number(pr?pr.value||0:0),cat:cat?cat.value:'Cap',stock:st?parseInt(st.value||'0'):0,desc:cleanDesc,photo:photo,status:'Live',live:true,featured:false,sold:0,likes:0,visitors:0,viewing:0}
      if(editIndex>=0){var old=list[editIndex];if(!photo&&old.photo){item.photo=old.photo}item.featured=old.featured||false;item.sold=old.sold||0;item.likes=old.likes||0;item.visitors=old.visitors||0;item.viewing=0;list[editIndex]=item;editIndex=-1}else{list.push(item)}
      saveProducts(list);
      try{playDing()}catch(e){}
      var t=document.getElementById('saveToast');if(t){t.style.display='block';t.textContent='Product Live - '+item.name;setTimeout(function(){t.style.display='none'},2000)}
      renderProducts();
    });
  }catch(e){alert('SAVE failed: '+e.message)}
}
window.editProduct = function(i){
  try{
    var list=getProducts();var p=list[i];if(!p){for(var k=0;k<list.length;k++){if(String(list[k].id)===String(i)){p=list[k];i=k;break;}}}if(!p){return};editIndex=i;renderProducts();
    setTimeout(function(){
      document.getElementById('prodName').value=p.name;document.getElementById('prodPrice').value=p.price;
      if(document.getElementById('prodCat')){document.getElementById('prodCat').value=p.cat||'Cap'}
      if(document.getElementById('prodStock')){document.getElementById('prodStock').value=p.stock||''}
      if(document.getElementById('prodDesc')){document.getElementById('prodDesc').value=p.desc||''}
      window.scrollTo(0,0);
    },50);
  }catch(e){}
}
function cancelEdit(){editIndex=-1;renderProducts()}
function toggleLive(i){try{var list=getProducts();var order=['Live','Draft','Out of Stock','Hidden','Archived'];var cur=list[i].status||(list[i].live===false?'Draft':'Live');var n=order.indexOf(cur);list[i].status=order[(n+1)%order.length];list[i].live=(list[i].status==='Live');saveProducts(list);renderProducts()}catch(e){}}function toggleFeatured(i){try{var list=getProducts();list[i].featured=!list[i].featured;saveProducts(list);renderProducts()}catch(e){}}
function buyProduct(i){
  try{
    var list=getProducts();var p=list[i];var whats=localStorage.getItem('regalia_whats')||'';
    var msg='Hi, I want to buy '+p.name+' R'+p.price+' from '+(localStorage.getItem('regalia_shop')||'BAFYZON STYLE');
    if(whats){window.open('https://wa.me/'+whats.replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(msg),'_blank')}else{alert('Add WhatsApp in Profile first, then Buy works')}
  }catch(e){}
}
function deleteProduct(i){try{if(!confirm('Delete this product?')){return};var list=getProducts();list.splice(i,1);saveProducts(list);renderProducts()}catch(e){}}
function saveProduct(){addProduct()}
window.addProduct=addProduct;window.saveProduct=saveProduct;window.renderProducts=renderProducts;window.editProduct=editProduct;window.deleteProduct=deleteProduct;window.toggleLive=toggleLive;window.toggleFeatured=toggleFeatured;window.buyProduct=buyProduct;window.cancelEdit=cancelEdit;
function _installProdShowView(){try{if(typeof showView==='function'&&!showView._prodWrapped){var _old=showView;var _nw=function(v){_old(v);if(v==='prod'){renderProducts()}};_nw._prodWrapped=true;showView=_nw;return true}}catch(e){}return false}if(!_installProdShowView()){setTimeout(_installProdShowView,500)};renderProducts();setTimeout(renderProducts,300);
