const container = document.getElementById("product-container");

// Paste your Google Sheet CSV link here
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxxx/pub?output=csv";

let previousData = "";

async function loadProducts() {
  try {
    const response = await fetch(sheetURL + "&cacheBust=" + Date.now());
    const data = await response.text();

    if (data !== previousData) {
      previousData = data;
      const products = csvToJson(data);
      renderProducts(products);
      console.log("Updated product list loaded");
    }
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

// smooth auto-scroll
setInterval(() => {
  container.scrollBy({ left: 220, behavior: "smooth" });
  loopScroll();
}, 2000);

// auto-refresh every 60 seconds
setInterval(loadProducts, 60000);

// first load
loadProducts();
