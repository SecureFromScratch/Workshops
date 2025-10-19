'use strict';
import { state, els, setHidden, fmtPrice, fetchJSON, showStatus } from './core.js';

let itemsApi; // provided by main.js

export function init({ itemsApi: injectedItems }) {
  itemsApi = injectedItems;

  if (els.couponApply) {
    els.couponApply.addEventListener('click', applyCoupon);
  }
  if (els.couponCodeInp) {
    els.couponCodeInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') applyCoupon();
    });
  }

  if (els.buyBtn) {
    els.buyBtn.addEventListener('click', onBuy);
  }
}

export function toCartMap(lines) {
  const m = new Map();
  for (const ln of (lines || [])) {
    //if (!ln || ln.quantity <= 0) continue;
    m.set(String(ln.itemId), {
      quantity: Number(ln.quantity),
      unitPrice: Number(ln.unitPrice),
      totalPrice: Number(ln.totalPrice),
      discountedPrice: ln.discountedPrice != null ? Number(ln.discountedPrice) : null
    });
  }
  return m;
}

export function renderAll() {
  renderCart();
  renderCoupons();
  renderTotals();
}

function renderCart() {
  els.cartList.innerHTML = '';
  const frag = document.createDocumentFragment();
  let total = 0;

  for (const [itemId, line] of state.cart) {
    const item = state.items.find(x => String(x.id) === String(itemId));
    const el = els.tplCartLine.content.firstElementChild.cloneNode(true);

    const thumb = el.querySelector('.cart-thumb');
    if (item?.filePath && item?.mimeType?.startsWith('image/')) {
      thumb.src = `/api/v1/image/${encodeURIComponent(item.filePath)}`;
      thumb.alt = item.name ? `${item.name} image` : 'item image';
    } else {
      thumb.removeAttribute('src');
    }

    el.querySelector('.cart-name').textContent = item?.name ?? `Item ${itemId}`;
    el.querySelector('.cart-qty').textContent = `x${line.quantity}`;
    el.querySelector('.cart-unit').textContent = `@ ${fmtPrice(line.unitPrice)}`;

    const effective = (line.discountedPrice ?? line.totalPrice);
    total += Number(effective) || 0;

    el.querySelector('.cart-total').textContent = `= ${fmtPrice(line.totalPrice)}`;

    frag.appendChild(el);
  }

  els.cartList.appendChild(frag);
  
  const isEmpty = state.cart.size === 0;
  
  //setHidden(els.cartFooter, false);
  setHidden(els.cartEmpty, !isEmpty);

  // Repaint items so qty boxes appear/disappear
  itemsApi.renderItems();

  state.total = total;
  state.discountedTotal = total;
}

export function renderTotals() {
  const total = state.total;
  let discountedTotal = state.discountedTotal || total;

  els.cartTotal.textContent = fmtPrice(total);
  let overBudgetElement = els.cartTotal;

  if (discountedTotal < total) {
    els.cartDiscounted.textContent = fmtPrice(discountedTotal);
    els.cartSavings.textContent = fmtPrice(total - discountedTotal);
    setHidden(els.cartHolderOfDiscounted, false);
    setHidden(els.cartHolderOfSavings, false);
    overBudgetElement = els.cartDiscounted;
  } else {
    setHidden(els.cartHolderOfDiscounted, true);
    setHidden(els.cartHolderOfSavings, true);
    discountedTotal = total;
  }

  // Paint credit (can be null if endpoint failed)
  if (state.creditBalance == null) {
    els.cartCredit.textContent = '—';
  } else {
    els.cartCredit.textContent = fmtPrice(state.creditBalance);
  }

  const overBudget = (state.creditBalance != null) && (discountedTotal > state.creditBalance);

  // Ensure no element has the over budget state
  els.cartTotal.classList.remove('over-budget');
  els.cartDiscounted.classList.remove('over-budget');
  els.cartCredit.classList.remove('over-budget');
  // Paint over-budget state
  if (overBudget) {
    overBudgetElement.classList.add('over-budget');
    els.cartCredit.classList.add('over-budget');
  }

  const isEmpty = state.cart.size === 0;
  els.buyBtn.disabled = isEmpty || overBudget;
}

function renderCoupons() {
  let discounted = state.total;
  state.discountedTotal = state.total;

  if (!els.couponsList || !els.couponTpl) return;
  els.couponsList.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const c of state.coupons) {
    console.log(c);
    const node = els.couponTpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.coupon-code').textContent = c.couponCode;
    node.querySelector('.coupon-percent').textContent = `(${c.percent}% off)`;

    const btn = node.querySelector('.coupon-remove');
    btn.dataset.couponId = String(c.couponId);
    btn.addEventListener('click', () => removeCoupon(c.couponId), { once: true });

    discounted = (100.0 - c.percent) * discounted / 100.0;

    frag.appendChild(node);
  }

  state.discountedTotal = discounted;

  els.couponsList.appendChild(frag);
}

export function updateCartItem(itemId, quantity) {
  const key = String(itemId);
  if (quantity <= 0) state.cart.delete(key);
  else {
    const it = state.items.find(x => String(x.id) === key);
    const unit = it?.price ?? state.cart.get(key)?.unitPrice ?? 0;
    state.cart.set(key, { quantity, unitPrice: unit, totalPrice: unit * quantity, discountedPrice: null });
  }
  // Optimistic UI
  renderAll();
  // Persist debounced
  debouncedPersist();
}

async function removeCoupon(couponId) {
  try {
    showStatus(true, 'Removing coupon…');
    const res = await fetch('/api/v1/order/remove-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ walletCode: state.walletCode, couponId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Remove failed' }));
      throw new Error(err?.message || ('HTTP ' + res.status));
    }

    // keep order of remaining coupons
    state.coupons = state.coupons.filter(c => String(c.couponId) !== String(couponId));

    renderCoupons();
    renderTotals();
    showStatus(false);
  } catch (e) {
    showStatus(true, `Remove failed: ${e?.message || e}`);
  }
}

function debounce(fn, ms) { let id; return (...args) => { clearTimeout(id); id = setTimeout(()=>fn(...args), ms); }; }
const debouncedPersist = debounce(persistCart, 300);

async function persistCart() {
  const items = [...state.cart.entries()].map(([itemId, line]) => ({ itemId, quantity: line.quantity }));
  try {
    const body = JSON.stringify({ walletCode: state.walletCode, lines: items });
    const updated = await fetchJSON('/api/v1/order/change', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body
    });
    if (!updated?.lines) {
      throw new Error('failed updating cart on server');
    }
    //state.cart = toCartMap(updated.lines);
    //renderCart();
    showStatus(false);
  } catch (e) {
    showStatus(true, `Cart update failed: ${e?.message || e}`);
  }
}

async function applyCoupon() {
  const code = (els.couponCodeInp?.value || '').trim();
  if (code.length < 3 || code.length > 64) {
    showStatus(true, 'Invalid coupon');
    return;
  }
  try {
    els.couponApply.disabled = true;
    showStatus(true, 'Applying coupon…');

    const data = await fetchJSON('/api/v1/order/redeem-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ walletCode: state.walletCode, code })
    });

    // append to the end to preserve apply order
    state.coupons.push({
      id: data.id,
      couponCode: data.couponCode,
      couponId: data.couponId,
      percent: data.percent
    });

    renderCoupons();
    renderTotals();

    showStatus(false);
  } catch (e) {
    showStatus(true, `Coupon failed: ${e?.message || e}`);
  } finally {
    els.couponApply.disabled = false;
  }
}

async function onBuy() {
  if (els.buyBtn.disabled) return;
  const lines = [...state.cart.entries()].map(([itemId, line]) => ({
    itemId: Number(itemId),
    quantity: Number(line.quantity)
  }));
  try {
    els.buyBtn.disabled = true;
    showStatus(true, 'Placing order…');
    const payload = {
      lines,
      walletCode: state.walletCode
    };
    const res = await fetchJSON('/api/v1/order/buy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    // Assuming success: clear local cart and refresh from server (if any)
    state.cart.clear();
    state.coupons = [];
    const current = await fetchJSON('/api/v1/order/' + state.walletCode).catch(() => null);
    if (current?.lines) state.cart = toCartMap(current.lines);
    if (current?.coupons) state.coupons = current.coupons;
    console.log(state.coupons);

    renderAll();
    showStatus(false);
  } catch (e) {
    showStatus(true, `Buy failed: ${e?.message || e}`);
  } finally {
    // re-evaluate disabled state after attempt
    const total = [...state.cart.values()].reduce((s, ln) => s + (ln.discountedPrice ?? ln.totalPrice ?? 0), 0);
    const overBudget = (state.creditBalance != null) && (total > state.creditBalance);
    els.buyBtn.disabled = (state.cart.size === 0) || overBudget;
  }
}
