/**
 * components.js — reusable UI helpers (DRY)
 *
 * Import this in every page AFTER api.js.
 * Every piece of repeated HTML or logic lives here once.
 */

// ── Navigation ─────────────────────────────────────────────────────────────

/**
 * Render the shared nav into the element with id="nav-root".
 * Highlights the link that matches the current page.
 *
 * @param {string} activePage  - 'products' | 'stores' | 'cart' | 'orders'
 */
function renderNav(activePage = '') {
  const user = getUser();

  const links = [
    { href: '/',            label: 'Products', key: 'products' },
    { href: '/stores.html', label: 'Stores',   key: 'stores'   },
    { href: '/cart.html',   label: 'Cart',     key: 'cart'     },
  ];

  if (user) {
    links.push({ href: '/orders.html', label: 'My Orders', key: 'orders' });
  }

  const linkHtml = links.map(l =>
    `<a href="${l.href}" class="${l.key === activePage ? 'active' : ''}">${l.label}</a>`
  ).join('');

  const authHtml = user
    ? `<span id="navUser">Hi, ${user.name.split(' ')[0]}</span>
       <span id="navLogout" onclick="logout()">Logout</span>`
    : `<a href="/login.html"    ${activePage === 'login'    ? 'class="active"' : ''}>Login</a>
       <a href="/register.html" ${activePage === 'register' ? 'class="active"' : ''}>Register</a>`;

  const el = document.getElementById('nav-root');
  if (!el) return;

  el.innerHTML = `
    <a class="brand" href="/">CuMartplace</a>
    <div class="nav-links">${linkHtml}${authHtml}</div>
  `;
}

function logout() {
  clearSession();
  window.location.href = '/login.html';
}

// ── Auth guard ─────────────────────────────────────────────────────────────

/** Redirect to login if the user is not logged in. */
function requireAuth() {
  if (!getToken()) window.location.href = '/login.html';
}

/** Redirect to home if already logged in (use on login/register pages). */
function redirectIfLoggedIn() {
  if (getToken()) window.location.href = '/';
}

// ── Alerts ─────────────────────────────────────────────────────────────────

/**
 * Show a dismissing alert inside a container element.
 *
 * @param {string} containerId  - id of a <div> to inject the alert into
 * @param {string} message
 * @param {'error'|'success'} type
 * @param {number} duration     - ms before auto-dismiss (0 = never)
 */
function showAlert(containerId, message, type = 'error', duration = 4000) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  if (duration > 0) setTimeout(() => el.classList.remove('show'), duration);
}

function hideAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.classList.remove('show');
}

// ── Spinner ────────────────────────────────────────────────────────────────

function showSpinner(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="spinner"></div>';
}

// ── Product card ───────────────────────────────────────────────────────────

/**
 * Build the HTML for a single product card.
 * Used by index.html and anywhere else products are listed.
 *
 * @param {object} p  - ProductRow from the API
 * @returns {string}  - HTML string
 */
function productCardHtml(p) {
  const price  = parseFloat(p.price).toLocaleString();
  const rating = parseFloat(p.avg_rating).toFixed(1);
  const img    = p.image_url || 'https://placehold.co/240x160?text=No+Image';

  return `
    <div class="card">
      <img src="${img}" alt="${p.name}">
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="price">₦${price}</div>
        <div class="store">by ${p.store_name} · ${p.category_name}</div>
        <div class="rating">★ ${rating} (${p.review_count} reviews)</div>
        <a href="/product.html?id=${p.product_id}" class="btn btn-primary btn-sm btn-full">View Details</a>
      </div>
    </div>`;
}

// ── Review card ────────────────────────────────────────────────────────────

/**
 * Build the HTML for a single review card.
 * Used by product.html.
 *
 * @param {object} r  - ProductReviewRow from the API
 * @returns {string}
 */
function reviewCardHtml(r) {
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  return `
    <div class="review-card">
      <div class="reviewer">${r.first_name} ${r.last_name}</div>
      <div class="stars">${stars}</div>
      <div class="comment">${r.comment || ''}</div>
    </div>`;
}

// ── Store card ─────────────────────────────────────────────────────────────

/**
 * Build the HTML for a single store card.
 * Used by stores.html.
 *
 * @param {object} s  - StoreRow from the API
 * @returns {string}
 */
function storeCardHtml(s) {
  const rating = parseFloat(s.avg_rating).toFixed(1);
  const img    = s.logo_url || 'https://placehold.co/240x160?text=Store';

  return `
    <div class="card store-card">
      <img src="${img}" alt="${s.store_name}">
      <div class="card-body">
        <h3>${s.store_name}</h3>
        <p>${s.description || 'No description.'}</p>
        <div class="rating">★ ${rating} (${s.rating_count} ratings)</div>
        <a href="/?store_id=${s.store_id}" class="btn btn-dark btn-sm btn-full">Browse Products</a>
      </div>
    </div>`;
}

// ── Empty state ────────────────────────────────────────────────────────────

/**
 * Render an empty-state message into a container.
 *
 * @param {string} containerId
 * @param {string} message
 * @param {string|null} linkHref   - optional CTA link
 * @param {string|null} linkLabel
 */
function renderEmpty(containerId, message, linkHref = null, linkLabel = null) {
  const cta = linkHref
    ? `<a href="${linkHref}" class="btn btn-primary" style="margin-top:16px">${linkLabel}</a>`
    : '';
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty"><p>${message}</p>${cta}</div>`;
}

// ── Order status badge ─────────────────────────────────────────────────────

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status.toUpperCase()}</span>`;
}

// ── Format currency ────────────────────────────────────────────────────────

function naira(amount) {
  return `₦${parseFloat(amount).toLocaleString()}`;
}
