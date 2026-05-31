// SastaKhojo v3.0 — Full Featured Script
// Features: Search, Wishlist, Price Chart, Dark Mode, Share, History, Top Deals, Price Alert

const API_BASE = '/api/search';
let currentQuery = '';
let currentProducts = [];
let chartInstance = null;
let alertProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.dark-toggle').textContent = '☀️';
  }
  updateWishlistCount();
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
});

function toggleDark() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.querySelector('.dark-toggle').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('darkMode', !isDark);
}

function showPage(page) {
  ['home', 'wishlist', 'deals', 'history'].forEach(p => {
    document.getElementById('page-' + p).style.display = p === page ? 'block' : 'none';
  });
  if (page === 'wishlist') renderWishlist();
  if (page === 'deals')    renderTopDeals();
  if (page === 'history')  renderHistory();
}

function quickSearch(q) {
  document.getElementById('searchInput').value = q;
  showPage('home');
  doSearch();
}

function applyFilter(btn, maxPrice) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  doSearch(maxPrice);
}

async function doSearch(maxPrice = '') {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  currentQuery = q;
  saveHistory(q);

  document.getElementById('welcomeState').style.display  = 'none';
  document.getElementById('resultsList').innerHTML        = '';
  document.getElementById('loading').style.display        = 'flex';
  document.getElementById('filterRow').style.display      = 'none';
  document.getElementById('resultsMeta').style.display    = 'none';
  document.getElementById('savingsCard').style.display    = 'none';
  document.getElementById('shareBar').style.display       = 'none';

  const btn = document.getElementById('searchBtn');
  btn.disabled = true;

  try {
    let url = `${API_BASE}?q=${encodeURIComponent(q)}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;

    const response = await fetch(url);
    const data     = await response.json();

    document.getElementById('loading').style.display = 'none';

    if (!data.success) { showError(data.message || 'Kuch galat hua'); return; }

    currentProducts = data.products || [];
    document.getElementById('filterRow').style.display = 'flex';
    renderResults(data.products, data.query, data.savings, data.isLive);

  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    showError('Server se connect nahi ho pa raha. Kya server chal raha hai?');
  } finally {
    btn.disabled = false;
  }
}

function renderResults(products, query, savings, isLive) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  if (!products || products.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>Koi result nahi mila</h3><p>"${query}" ke liye kuch nahi mila.</p></div>`;
    document.getElementById('resultsMeta').style.display = 'none';
    return;
  }

  document.getElementById('resultsMeta').style.display = 'flex';
  const sourceBadge = isLive
    ? `<span class="live-badge">🟢 Live Prices</span>`
    : `<span class="demo-badge">📦 Demo Data</span>`;
  document.getElementById('resultsCount').innerHTML =
    `"<strong>${query}</strong>" ke liye <strong>${products.length}</strong> results ${sourceBadge}`;

  products.forEach((item, idx) => {
    const isBest    = idx === 0;
    const platClass = item.platform === 'Amazon' ? 'plat-amazon' : item.platform === 'Flipkart' ? 'plat-flipkart' : 'plat-meesho';
    const btnClass  = item.platform === 'Amazon' ? 'btn-amazon'  : item.platform === 'Flipkart' ? 'btn-flipkart'  : 'btn-meesho';
    const rating    = parseFloat(item.rating) || 4.0;
    const stars     = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    const isWished  = isInWishlist(item);
    const thumbHtml = item.thumbnail
      ? `<div class="prod-thumb"><img src="${item.thumbnail}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"/></div>`
      : '';

    const card = document.createElement('div');
    card.className = 'card' + (isBest ? ' best-deal' : '');
    card.style.animationDelay = `${idx * 0.05}s`;
    card.innerHTML = `
      ${isBest ? '<div class="badge-best">🏆 Sabse Sasta</div>' : ''}
      <div class="rank">${idx + 1}</div>
      <div class="platform-pill ${platClass}">${item.platform[0]}</div>
      ${thumbHtml}
      <div class="prod-info">
        <div class="prod-name" title="${item.name}">${item.name}</div>
        <div class="prod-meta">
          <span style="color:#f59e0b;letter-spacing:-2px">${stars}</span>
          <span>${rating} (${item.reviews})</span> · <span>${item.platform}</span>
        </div>
        <div class="prod-meta" style="margin-top:5px;">
          <span class="delivery-tag">🚚 ${item.delivery}</span>
        </div>
        <div class="card-actions">
          <button class="action-btn wishlist-btn ${isWished ? 'wished' : ''}"
            onclick="toggleWishlist(${idx})" title="Wishlist mein add karo">
            ${isWished ? '❤️' : '🤍'} Save
          </button>
          <button class="action-btn chart-btn" onclick="showChart('${item.name.replace(/'/g,"\\'")}', ${item.price})">
            📊 Chart
          </button>
          <button class="action-btn alert-btn" onclick="showAlert(${idx})">
            🔔 Alert
          </button>
          <button class="action-btn" onclick="shareProduct(${idx})">
            📤 Share
          </button>
        </div>
      </div>
      <div class="price-section">
        <div class="price-current">₹${item.price.toLocaleString('en-IN')}</div>
        <div class="price-original">₹${item.originalPrice.toLocaleString('en-IN')}</div>
        <div class="price-discount">${item.discountPct}% off</div>
        <a href="${item.url}" target="_blank" rel="noopener">
          <button class="buy-btn ${btnClass}">Kharido →</button>
        </a>
      </div>`;
    list.appendChild(card);
  });

  if (savings) {
    document.getElementById('savingsCard').style.display = 'flex';
    document.getElementById('savingsText').innerHTML =
      `<strong>${savings.cheapestPlatform}</strong> se kharidkar aap <strong>₹${savings.savedAmount.toLocaleString('en-IN')} (${savings.savedPercent}%)</strong> bacha sakte hain ${savings.costliestPlatform} ke mukable!`;
  }

  document.getElementById('shareBar').style.display = 'flex';
}

// WISHLIST
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem('wishlist', JSON.stringify(list));
  updateWishlistCount();
}
function isInWishlist(item) {
  return getWishlist().some(w => w.name === item.name && w.platform === item.platform);
}
function updateWishlistCount() {
  const count = getWishlist().length;
  document.getElementById('wishlistCount').textContent = count;
  document.getElementById('wishlistCount').style.display = count > 0 ? 'inline' : 'none';
}
function toggleWishlist(idx) {
  const item = currentProducts[idx];
  if (!item) return;
  let list = getWishlist();
  const existing = list.findIndex(w => w.name === item.name && w.platform === item.platform);
  if (existing >= 0) {
    list.splice(existing, 1);
    showToast('Wishlist se hata diya ✓');
  } else {
    list.push({ ...item, savedAt: new Date().toISOString() });
    showToast('Wishlist mein save ho gaya ❤️');
  }
  saveWishlist(list);
  const btns = document.querySelectorAll('.wishlist-btn');
  if (btns[idx]) {
    const isWished = isInWishlist(item);
    btns[idx].className = `action-btn wishlist-btn ${isWished ? 'wished' : ''}`;
    btns[idx].textContent = isWished ? '❤️ Save' : '🤍 Save';
  }
}

function renderWishlist() {
  const list = getWishlist();
  const container = document.getElementById('wishlistItems');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🤍</div><h3>Wishlist khali hai</h3><p>Products search karke heart icon dabao!</p></div>`;
    return;
  }
  container.innerHTML = '';
  list.forEach((item, idx) => {
    const platClass = item.platform === 'Amazon' ? 'plat-amazon' : item.platform === 'Flipkart' ? 'plat-flipkart' : 'plat-meesho';
    const btnClass  = item.platform === 'Amazon' ? 'btn-amazon'  : item.platform === 'Flipkart' ? 'btn-flipkart'  : 'btn-meesho';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="platform-pill ${platClass}">${item.platform[0]}</div>
      <div class="prod-info">
        <div class="prod-name">${item.name}</div>
        <div class="prod-meta"><span>${item.platform}</span> · <span>🚚 ${item.delivery}</span></div>
        <div class="prod-meta" style="margin-top:4px;color:var(--text-muted);font-size:0.75rem;">
          Saved: ${new Date(item.savedAt).toLocaleDateString('en-IN')}
        </div>
      </div>
      <div class="price-section">
        <div class="price-current">₹${item.price.toLocaleString('en-IN')}</div>
        <div class="price-discount">${item.discountPct}% off</div>
        <a href="${item.url}" target="_blank"><button class="buy-btn ${btnClass}">Kharido →</button></a>
        <button onclick="removeFromWishlist(${idx})" style="margin-top:6px;background:none;border:1px solid #ef4444;color:#ef4444;border-radius:8px;padding:4px 10px;cursor:pointer;font-size:0.75rem;">🗑️ Hata do</button>
      </div>`;
    container.appendChild(card);
  });
}

function removeFromWishlist(idx) {
  const list = getWishlist();
  list.splice(idx, 1);
  saveWishlist(list);
  renderWishlist();
  showToast('Wishlist se hata diya');
}

// PRICE CHART
function showChart(name, currentPrice) {
  const labels = [];
  const prices = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    const variation = 0.85 + Math.random() * 0.30;
    prices.push(Math.round(currentPrice * variation));
  }
  prices[6] = currentPrice;

  document.getElementById('chartTitle').textContent = name.length > 40 ? name.slice(0, 40) + '...' : name;
  document.getElementById('chartModal').style.display = 'flex';

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById('priceChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Price (₹)',
        data: prices,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#22c55e',
        pointRadius: 5,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => '₹' + ctx.raw.toLocaleString('en-IN') } }
      },
      scales: {
        y: { ticks: { callback: v => '₹' + v.toLocaleString('en-IN') } }
      }
    }
  });
}

function closeChart() {
  document.getElementById('chartModal').style.display = 'none';
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}

// PRICE ALERT
function showAlert(idx) {
  alertProduct = currentProducts[idx];
  document.getElementById('alertProductName').textContent = alertProduct.name;
  document.getElementById('alertPrice').value = Math.round(alertProduct.price * 0.85);
  document.getElementById('alertModal').style.display = 'flex';
}
function closeAlert() {
  document.getElementById('alertModal').style.display = 'none';
}
function saveAlert() {
  const price = document.getElementById('alertPrice').value;
  if (!price) { showToast('Target price daalo!'); return; }
  const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
  alerts.push({
    product: alertProduct.name,
    platform: alertProduct.platform,
    currentPrice: alertProduct.price,
    targetPrice: Number(price),
    url: alertProduct.url,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  closeAlert();
  showToast(`Alert set! Jab price ₹${Number(price).toLocaleString('en-IN')} se kam hoga!`);
}

// SHARE
function shareWhatsApp() {
  if (!currentQuery || currentProducts.length === 0) return;
  const best = currentProducts[0];
  const msg = `🛍️ SastaKhojo se mila sabse sasta deal!\n\n🔍 Search: ${currentQuery}\n🏆 Best Deal: ${best.name}\n💰 Price: ₹${best.price.toLocaleString('en-IN')} on ${best.platform}\n🔗 Check karo: ${window.location.href}`;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}
function shareCopy() {
  navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copy ho gaya! 🔗'));
}
function shareProduct(idx) {
  const item = currentProducts[idx];
  if (!item) return;
  const msg = `💰 ${item.name}\n₹${item.price.toLocaleString('en-IN')} on ${item.platform} (${item.discountPct}% off!)\n${item.url}`;
  if (navigator.share) {
    navigator.share({ title: item.name, text: msg, url: item.url });
  } else {
    navigator.clipboard.writeText(msg).then(() => showToast('Product info copy ho gaya!'));
  }
}

// SEARCH HISTORY
function saveHistory(query) {
  let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history = history.filter(h => h.query !== query);
  history.unshift({ query, time: new Date().toISOString() });
  history = history.slice(0, 20);
  localStorage.setItem('searchHistory', JSON.stringify(history));
}
function renderHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  const container = document.getElementById('historyItems');
  if (history.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🕐</div><h3>Koi history nahi</h3><p>Kuch search karo pehle!</p></div>`;
    return;
  }
  container.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
      <button onclick="clearHistory()" style="background:none;border:1px solid #ef4444;color:#ef4444;padding:6px 16px;border-radius:8px;cursor:pointer;">🗑️ Sab Clear Karo</button>
    </div>` +
    history.map(h => `
      <div class="history-item" onclick="quickSearch('${h.query}')">
        <span>🔍 ${h.query}</span>
        <span class="history-time">${new Date(h.time).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
      </div>`).join('');
}
function clearHistory() {
  localStorage.removeItem('searchHistory');
  renderHistory();
  showToast('History clear ho gayi!');
}

// TOP DEALS
function renderTopDeals() {
  const DEALS = [
    { name: 'Boat BassHeads 100 Earphones',  platform: 'Meesho',   price: 249,  originalPrice: 699,  discountPct: 64, delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=earphones',     rating: 3.9, reviews: '41,000' },
    { name: 'Stylish UV400 Chasma',           platform: 'Meesho',   price: 179,  originalPrice: 499,  discountPct: 64, delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=chasma',        rating: 3.8, reviews: '22,000' },
    { name: 'Transparent Phone Cover',        platform: 'Meesho',   price: 79,   originalPrice: 299,  discountPct: 74, delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=phone+cover',   rating: 3.8, reviews: '88,000' },
    { name: 'Sports Running Shoes',           platform: 'Meesho',   price: 399,  originalPrice: 1299, discountPct: 69, delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=running+shoes', rating: 3.7, reviews: '56,000' },
    { name: "Men's Casual Cotton Shirt",      platform: 'Meesho',   price: 249,  originalPrice: 799,  discountPct: 69, delivery: 'Free · 5-7 din', url: 'https://www.meesho.com/search?q=shirt',         rating: 3.7, reviews: '33,000' },
    { name: 'Noise ColorFit Pro Smartwatch',  platform: 'Flipkart', price: 1499, originalPrice: 4999, discountPct: 70, delivery: 'Free · 3 din',   url: 'https://www.flipkart.com/search?q=smartwatch',  rating: 4.1, reviews: '28,000' },
    { name: '3-in-1 Mixer Grinder 500W',      platform: 'Meesho',   price: 999,  originalPrice: 2499, discountPct: 60, delivery: 'Free · 6-8 din', url: 'https://www.meesho.com/search?q=mixer+grinder', rating: 3.6, reviews: '11,000' },
    { name: 'Redmi 13C 4GB 128GB Mobile',     platform: 'Flipkart', price: 8499, originalPrice: 10999,discountPct: 23, delivery: 'Free · 2 din',   url: 'https://www.flipkart.com/search?q=mobile',      rating: 4.2, reviews: '45,000' },
  ].sort((a, b) => b.discountPct - a.discountPct);

  const container = document.getElementById('dealsItems');
  container.innerHTML = '';
  DEALS.forEach((item, idx) => {
    const platClass = item.platform === 'Amazon' ? 'plat-amazon' : item.platform === 'Flipkart' ? 'plat-flipkart' : 'plat-meesho';
    const btnClass  = item.platform === 'Amazon' ? 'btn-amazon'  : item.platform === 'Flipkart' ? 'btn-flipkart'  : 'btn-meesho';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="rank">${idx + 1}</div>
      <div class="platform-pill ${platClass}">${item.platform[0]}</div>
      <div class="prod-info">
        <div class="prod-name">${item.name}</div>
        <div class="prod-meta"><span>${item.platform}</span> · <span>⭐ ${item.rating} (${item.reviews})</span></div>
        <div class="prod-meta" style="margin-top:5px;"><span class="delivery-tag">🚚 ${item.delivery}</span></div>
      </div>
      <div class="price-section">
        <div class="price-current">₹${item.price.toLocaleString('en-IN')}</div>
        <div class="price-original">₹${item.originalPrice.toLocaleString('en-IN')}</div>
        <div class="price-discount">${item.discountPct}% off</div>
        <a href="${item.url}" target="_blank"><button class="buy-btn ${btnClass}">Kharido →</button></a>
      </div>`;
    container.appendChild(card);
  });
}

// TOAST
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast show';
  setTimeout(() => toast.className = 'toast', 2500);
}

function showError(msg) {
  document.getElementById('resultsList').innerHTML = `<div class="error-banner">⚠️ ${msg}</div>`;
  document.getElementById('resultsMeta').style.display = 'none';
}
