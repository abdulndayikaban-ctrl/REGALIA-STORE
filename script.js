const products = [
  { name: "Base Hoodie Grey", image: "https://github.com/abdulndayikaban-ctrl/REGALIA-STORE/blob/main/Base-Hoodie-Grey-Melange%20(1).png?raw=true" },
  // Add more below (up to 20)
  { name: "Classic Black Tee", image: "https://via.placeholder.com/200x220?text=Black+Tee" },
  { name: "Royal Green Hoodie", image: "https://via.placeholder.com/200x220?text=Green+Hoodie" },
  { name: "Gold King T-Shirt", image: "https://via.placeholder.com/200x220?text=Gold+King" },
  { name: "Brown Heritage Tee", image: "https://via.placeholder.com/200x220?text=Brown+Heritage" }
];

const container = document.getElementById("product-container");

function renderProducts() {
  products.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("product");
    div.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}">
      <p>${prod.name}</p>
    `;
    container.appendChild(div);
  });
}

function loopScroll() {
  if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
    container.scrollTo({ left: 0, behavior: "smooth" });
  }
}

renderProducts();
setInterval(() => {
  container.scrollBy({ left: 220, behavior: "smooth" });
  loopScroll();
}, 2000);
