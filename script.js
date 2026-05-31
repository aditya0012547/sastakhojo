// script.js — SastaKhojo v2.0
// Backend se real/live prices fetch karta hai

const API_BASE = '/api/search';
let currentQuery = '';

// Enter key support
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function quickSearch(q) {
  document.getElementById('searchInput').value = q;
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

  // Loading state
  document.getElementById('welcomeState').style.display  = 'none';
  document.getElementById('resultsList').innerHTML        = '';
  document.getElementById('loading').style.display        = 'block';
  document.getElementById('filterRow').style.display      = 'none';
  document.getElementById('resultsMeta').style.display    = 'none';
  document.getElementById('savingsCard').style.display    = 'none';

  const btn = document.getElementById('searchBtn');
  btn.disabled = true;

  try {
    let url = `${API_BASE}?q=${encodeURIComponent(q)}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;

    const response = await fetch(url);
    const data     = await response.json();

    document.getElementById('loading').style.display = 'none';

    if (!data.success) {
      showError(data.message || 'Kuch galat hua, dobara try karein');
      return;
    }

    document.getElementById('filterRow').style.display = 'flex';
    renderResults(data.products, data.query, data.savings, data.isLive, data.dataSource);

  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    showError('Server se connect nahi ho pa raha. Kya server chal raha hai? (node server.js)');
    console.error('API Error:', err);
  } finally {
    btn.disabled = false;
  }
}

function renderResults(products, query, savings, isLive, dataSource) {
  const list = document.getElementById('resultsList');
  list.innerHTML = '';

  if (!products || products.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Koi result nahi mila</h3>
        <p>"${query}" ke liye is budget mein kuch nahi mila. Filter badal kar try karein.</p>
      </div>`;
    document.getElementById('resultsMeta').style.display = 'none';
    return;
  }

  // Results count + data source badge
  document.getElementById('resultsMeta').style.display = 'flex';
  const sourceBadge = isLive
    ? `<span class="live-badge">🟢 Live Prices</span>`
    : `<span class="demo-badge">📦 Demo Data</span>`;
  document.getElementById('resultsCount').innerHTML =
    `"<strong>${query}</strong>" ke liye <strong>${products.length}</strong> results ${sourceBadge}`;

  products.forEach((item, idx) => {
    const isBest    = idx === 0;
    const platClass = item.platform === 'Amazon'   ? 'plat-amazon'
                    : item.platform === 'Flipkart' ? 'plat-flipkart' : 'plat-meesho';
    const btnClass  = item.platform === 'Amazon'   ? 'btn-amazon'
                    : item.platform === 'Flipkart' ? 'btn-flipkart' : 'btn-meesho';
    const platLetter = item.platform[0];
    const rating     = parseFloat(item.rating) || 4.0;
    const stars      = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

    const card = document.createElement('div');
    card.className = 'card' + (isBest ? ' best-deal' : '');
    card.style.animationDelay = `${idx * 0.05}s`;

    // Thumbnail (agar SerpAPI ne diya)
    const thumbHtml = item.thumbnail
      ? `<div class="prod-thumb"><img src="${item.thumbnail}" alt="${item.name}" loading="lazy" onerror="this.parentElement.style.display='none'"/></div>`
      : '';

    card.innerHTML = `
      ${isBest ? '<div class="badge-best">🏆 Sabse Sasta</div>' : ''}
      <div class="rank">${idx + 1}</div>
      <div class="platform-pill ${platClass}">${platLetter}</div>
      ${thumbHtml}
      <div class="prod-info">
        <div class="prod-name" title="${item.name}">${item.name}</div>
        <div class="prod-meta">
          <span style="color:#f59e0b;letter-spacing:-2px">${stars}</span>
          <span>${rating} (${item.reviews})</span>
          <span>·</span>
          <span>${item.platform}</span>
        </div>
        <div class="prod-meta" style="margin-top:5px;">
          <span class="delivery-tag">🚚 ${item.delivery}</span>
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

  // Savings card
  if (savings) {
    document.getElementById('savingsCard').style.display = 'flex';
    document.getElementById('savingsText').innerHTML =
      `<strong>${savings.cheapestPlatform}</strong> se kharidkar aap ` +
      `<strong>₹${savings.savedAmount.toLocaleString('en-IN')} (${savings.savedPercent}%)</strong> ` +
      `bacha sakte hain ${savings.costliestPlatform} ke mukable!`;
  }
}

function showError(msg) {
  document.getElementById('resultsList').innerHTML = `
    <div class="error-banner">⚠️ ${msg}</div>`;
  document.getElementById('resultsMeta').style.display = 'none';
}
