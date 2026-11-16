function getProducts(){try{return JSON.parse(localStorage.getItem('regalia_products')||'[]')}catch(e){return[]}}
function saveProducts(list){try{localStorage.setItem('regalia_products',JSON.stringify(list))}catch(e){}}
function renderProducts(){
  try{
    var box=document.getElementById('view-prod');if(!box){return}
    var list=getProducts();
    var html='<h2>PROD - Your Products</h2><p style="color:#9ba8b6">'+list.length+' real products - 0 until you add real one</p>';
    html+='<input id="prodName" placeholder="Product name" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px">';
    html+='<input id="prodPrice" placeholder="Price - e.g. 250" type="number" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#0b0d12;color:#f3f5f8;margin-bottom:8px">';
    html+='<button onclick="addProduct()" style="background:#d4af37;color:#0b0d12;border:0;border-radius:999px;padding:10px 18px;font-weight:800">Add Product</button><div id="prodList" style="margin-top:14px"></div>';
    box.innerHTML=html;
    var listEl=document.getElementById('prodList');
    if(list.length===0){listEl.innerHTML='<p style="color:#9ba8b6">No products yet. Add your first real product.</p>';return}
    list.forEach(function(p,i){
      var d=document.createElement('div');
      d.style.cssText='background:#141922;border:1px solid #333;border-radius:12px;padding:12px;margin-bottom:10px';
      d.innerHTML='<b style="color:#f3f5f8">'+p.name+'</b> <span style="color:#d4af37">R'+p.price+'</span> <span style="background:#d4af37;color:#0b0d12;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:800">Live</span><br><button onclick="editProduct('+i+')" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:6px 12px;margin-top:8px">Edit</button> <button onclick="deleteProduct('+i+')" style="background:transparent;color:#f3f5f8;border:1px solid #333;border-radius:999px;padding:6px 12px;margin-top:8px">Delete</button>';
      listEl.appendChild(d);
    });
  }catch(e){}
}
function addProduct(){
  try{
    var n=document.getElementById('prodName');var pr=document.getElementById('prodPrice');
    if(!n||!n.value.trim()){alert('Type product name');return}
    var list=getProducts();list.push({name:n.value.trim(),price:pr?pr.value||'0':'0'});saveProducts(list);
    try{playDing()}catch(e){}
    var t=document.getElementById('saveToast');if(t){t.style.display='block';t.textContent='Product Live';setTimeout(function(){t.style.display='none'},2000)}
    renderProducts();
  }catch(e){}
}
function editProduct(i){
  try{
    var list=getProducts();var p=list[i];if(!p){return}
    var nn=prompt('Edit product name',p.name);if(nn===null){return}
    var pp=prompt('Edit price',p.price);if(pp===null){return}
    list[i]={name:nn,price:pp};saveProducts(list);renderProducts();
  }catch(e){}
}
function deleteProduct(i){
  try{
    if(!confirm('Delete this product?')){return}
    var list=getProducts();list.splice(i,1);saveProducts(list);renderProducts();
  }catch(e){}
}
function saveProduct(){addProduct()}
try{var _oldShowView=showView;showView=function(v){_oldShowView(v);if(v==='prod'){renderProducts()}}}catch(e){}
try{renderProducts()}catch(e){}
