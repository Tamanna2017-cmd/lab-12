const CURRENCY = "$";
let products = [];
let activeCategory = "All";

function money(value) {
  return CURRENCY + Number(value).toFixed(2);
}

async function loadProducts() {
  try {
    const response = await fetch("data/products.xml");
    if (!response.ok) throw new Error("Could not load XML product data.");
    const xmlText = await response.text();
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("The XML file has a format error.");

    products = Array.from(xml.querySelectorAll("product")).map(item => ({
      id: item.getAttribute("id"),
      name: item.querySelector("name").textContent,
      category: item.querySelector("category").textContent,
      price: Number(item.querySelector("price").textContent),
      description: item.querySelector("description").textContent,
      emoji: item.querySelector("emoji").textContent,
      badge: item.querySelector("badge").textContent
    }));

    renderFeatured();
    renderProducts();
    renderCart();
    updateCartCount();
  } catch (error) {
    document.querySelectorAll("#featured-products, #all-products").forEach(el => {
      if (el) el.innerHTML = `<p class="empty-state">${error.message} Please open this project with Live Server.</p>`;
    });
    const cart = document.getElementById("cart-items");
    if (cart) cart.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

function productCard(product) {
  const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : "";
  return `
    <article class="product-card">
      <div class="product-visual">${badge}<span class="product-emoji">${product.emoji}</span></div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="product-description">${escapeHTML(product.description)}</p>
        <div class="product-bottom"><strong>${money(product.price)}</strong><button class="add-button" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">+</button></div>
      </div>
    </article>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

function renderFeatured() {
  const target = document.getElementById("featured-products");
  if (!target) return;
  target.innerHTML = products.slice(0, 4).map(productCard).join("");
}

function renderProducts() {
  const target = document.getElementById("all-products");
  if (!target) return;
  const search = (document.getElementById("product-search")?.value || "").toLowerCase();
  const filtered = products.filter(product => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const searchMatch = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });
  target.innerHTML = filtered.length ? filtered.map(productCard).join("") : '<p class="empty-state">No products found. Try another search.</p>';
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("novaCart") || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem("novaCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart(cart);
  const button = document.querySelector(`[data-add="${id}"]`);
  if (button) {
    button.textContent = "✓";
    setTimeout(() => button.textContent = "+", 700);
  }
}

function renderCart() {
  const target = document.getElementById("cart-items");
  if (!target || !products.length) return;
  const cart = getCart();
  if (!cart.length) {
    target.innerHTML = '<div class="empty-cart"><span>🛍️</span><h2>Your bag is waiting</h2><p>You have not added anything yet.</p><a class="text-link" href="products.html">Explore products →</a></div>';
    document.getElementById("cart-subtotal").textContent = money(0);
    document.getElementById("cart-total").textContent = money(0);
    return;
  }
  let subtotal = 0;
  target.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";
    subtotal += product.price * item.quantity;
    return `<article class="cart-row">
      <div class="cart-emoji">${product.emoji}</div>
      <div class="cart-product"><h3>${escapeHTML(product.name)}</h3><p>${money(product.price)} each</p>
        <div class="quantity-control">
          <button data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
          <button class="remove-button" data-remove="${product.id}">Remove</button>
        </div>
      </div>
      <strong>${money(product.price * item.quantity)}</strong>
    </article>`;
  }).join("");
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-total").textContent = money(subtotal);
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const quantity = event.target.closest("[data-quantity]");
  if (quantity) {
    const cart = getCart();
    const item = cart.find(entry => entry.id === quantity.dataset.quantity);
    if (item) item.quantity += Number(quantity.dataset.change);
    saveCart(cart.filter(entry => entry.quantity > 0));
    renderCart();
  }

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    saveCart(getCart().filter(item => item.id !== remove.dataset.remove));
    renderCart();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  const filterArea = document.getElementById("category-filters");
  if (filterArea) {
    const categories = ["All", ...new Set(["Style", "Beauty", "Living", "Gadgets"])];
    filterArea.innerHTML = categories.map(category =>
      `<button class="filter-button ${category === "All" ? "selected" : ""}" data-category="${category}">${category}</button>`
    ).join("");
    filterArea.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      filterArea.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("selected", item === button));
      renderProducts();
    });
  }

  document.getElementById("product-search")?.addEventListener("input", renderProducts);

  document.getElementById("checkout-button")?.addEventListener("click", () => {
    const cart = getCart();
    const message = document.getElementById("checkout-message");
    if (!cart.length) {
      message.textContent = "Your bag is empty. Add a product first.";
      message.className = "checkout-feedback error-text";
      return;
    }
    localStorage.removeItem("novaCart");
    renderCart();
    updateCartCount();
    message.textContent = "Thank you! Your sample order has been placed successfully.";
    message.className = "checkout-feedback success-text";
  });

  document.getElementById("contact-form")?.addEventListener("submit", event => {
    event.preventDefault();
    document.getElementById("contact-feedback").textContent = "Thank you! Your message has been received (demo only).";
    event.target.reset();
  });
});
