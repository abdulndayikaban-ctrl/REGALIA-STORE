const container = document.getElementById("product-container");

async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function renderProducts(products) {
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

setInterval(() => {
  container.scrollBy({ left: 220, behavior: "smooth" });
  loopScroll();
}, 2000);

loadProducts();
