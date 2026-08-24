let allProducts=[];
fetch('products.json').then(r=>r.json()).then(d=>{allProducts=d.products||d;render(allProducts);}).catch(()=>{document.getElementById('products').innerHTML='Ready for Lesson 1 - no products yet';});
function render(list){
  const div=document.getElementById('products');
  if(!list||list.length===0){div.innerHTML='No products yet - Lesson 1 will fill';return;}
  div.innerHTML=list.map(p=>`<div class="card"><img src="${p.image}" onerror="this.src='https://via.placeholder.com/180'"><h3>${p.name}</h3><p>R${p.price_50}</p><small>${p.category}</small></div>`).join('');
}
function filterCat(cat,btn){
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(cat==='ALL')render(allProducts);
  else render(allProducts.filter(p=>(p.category||'BUY')===cat));
}