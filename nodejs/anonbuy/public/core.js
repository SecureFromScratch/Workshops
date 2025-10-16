'use strict';

// ===== Shared state & DOM refs (no imports; core module to avoid cycles) =====
export const state = {
  items: [],
  filtered: [],
  cart: new Map(), // itemId -> { quantity, unitPrice, totalPrice, discountedPrice }
  idempotencyKey: loadIdem(),
  creditBalance: null
};

export const els = {
  status: document.getElementById('status'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  q: document.getElementById('q'),
  //onlyActive: document.getElementById('onlyActive'),
  tplItem: document.getElementById('item-card'),
  tplCartLine: document.getElementById('cart-line'),
  cartList: document.getElementById('cart-list'),
  cartEmpty: document.getElementById('cart-empty'),
  cartFooter: document.getElementById('cart-footer'),
  cartTotal: document.getElementById('cart-total'),
  cartCredit: document.getElementById('cart-credit'),
  couponCode: document.getElementById('coupon-code'),
  couponApply: document.getElementById('coupon-apply'),
  buyBtn: document.getElementById('buy-btn'),
};

// ===== Utilities (bodies preserved) =====
export function setText(el, v) { el.textContent = v ?? ''; }
export function setHidden(el, hidden) { hidden ? el.setAttribute('hidden', '') : el.removeAttribute('hidden'); }

export function guessCurrency() {
    const loc = navigator.language || 'en-US';
    if (loc.startsWith('he') || loc.endsWith('-IL')) return 'ILS';
    if (loc.startsWith('en-GB')) return 'GBP';
    if (loc.startsWith('en')) return 'USD';
    return 'USD';
}
export function fmtPrice(n) {
    if (typeof n !== 'number') return '';
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currencyDisplay: 'narrowSymbol', currency: guessCurrency() }).format(n);
    } catch { return n.toFixed(2); }
}
export function fmtDate(s) {
    if (!s) return '';
    const d = typeof s === 'string' || typeof s === 'number' ? new Date(s) : s;
    if (Number.isNaN(+d)) return '';
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
}

export async function fetchJSON(url, opts={}) {
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'accept':'application/json', ...(opts.headers||{}) } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally { 
    clearTimeout(t); 
  }
}

export function showStatus(show, msg) {
    console.log("status:", show, msg);
    if (show) {
        setText(els.status.lastElementChild, msg || '');
        els.status.hidden = false;
    } else {
        els.status.hidden = true;
    }
}

function loadIdem(){ 
    const k = sessionStorage.getItem('idem'); 
    if (k) return k; 
    const v = crypto.randomUUID?.() || String(Date.now())+Math.random(); 
    sessionStorage.setItem('idem', v); 
    return v; 
}

export function getUserId() {
  const v = Number(localStorage.getItem('userId'));
  return Number.isFinite(v) && v > 0 ? v : null;
}
