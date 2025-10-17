'use strict';

// ===== Shared state & DOM refs (no imports; core module to avoid cycles) =====
export const state = {
  items: [],
  filtered: [],
  cart: new Map(), // itemId -> { quantity, unitPrice, totalPrice }
  coupons: [],
  cartTotal: 0,
  discountedTotal: 0,
  //idempotencyKey: loadIdem(),
  walletCode: loadWalletCode(),
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
  cartHolderOfDiscounted: document.getElementById('cart-holder-discounted'),
  cartDiscounted: document.getElementById('cart-discounted'),
  cartHolderOfSavings: document.getElementById('cart-holder-savings'),
  cartSavings: document.getElementById('cart-savings'),
  cartCredit: document.getElementById('cart-credit'),

  couponApply: document.getElementById('coupon-apply'),
  couponsList: document.getElementById('coupons-list'),
  couponTpl: document.getElementById('coupon-pill'),
  couponCodeInp: document.getElementById('coupon-code'),

  buyBtn: document.getElementById('buy-btn'),

  walletMergeBtn: document.getElementById('wallet-merge-btn'),
  walletMergeDlg: document.getElementById('wallet-merge-dialog'),
  walletMergeCode: document.getElementById('wallet-merge-code'),
  walletMergeCancel: document.getElementById('wallet-merge-cancel'),
  walletMergeOk: document.getElementById('wallet-merge-ok'),
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
    const res = await fetch(
      url, { 
        ...(opts.body ? { method: 'POST' } : {}), // before spread of opts to allow override of method
        ...opts, 
        signal: ctrl.signal, 
        headers: { 
          'accept':'application/json', 
          ...(opts.headers||{}) 
        } 
      });
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;
    if (!res.ok || !data) {
      if (data && data.message) {
        throw new Error(data.message);
      }
      else {
        throw new Error('HTTP ' + res.status);
      }
    }
    return data;
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

/*function loadIdem(){ 
    const k = sessionStorage.getItem('idem'); 
    if (k) return k; 
    const v = crypto.randomUUID?.() || String(Date.now())+Math.random(); 
    sessionStorage.setItem('idem', v); 
    return v; 
}*/

function loadWalletCode(){ 
    const k = sessionStorage.getItem('walletCode'); 
    if (k) return k; 
    window.location.assign("/index.html"); // surf back to main page 
}

export function getUserId() {
  const v = Number(localStorage.getItem('userId'));
  return Number.isFinite(v) && v > 0 ? v : null;
}
