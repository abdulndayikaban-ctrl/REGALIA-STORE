const container = document.getElementById("product-container");

// Paste your published CSV link below
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxxx/pub?output=csv";

async function loadProducts() {
  try {
    const response = await fetch(sheetURL);
    const data = await response.text();
    const products = csvToJson(data);
    renderProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function csvToJson(csv) {
  const rows = csv.split("\n").map(r => r.trim()).filter(Boolean);
  const headers = rows.shift().split(",");
  return rows.map(row => {
    const values = row.split(",");
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
    return obj;
  });
}

function renderProducts(products) {
  container.innerHTML = "";
  products.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("product");
    div.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}">
      <p>${prod.name} - R${prod.price}</p>
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
