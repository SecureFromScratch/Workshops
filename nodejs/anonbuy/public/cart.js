'use strict';
import { state, els, setText, setHidden, fmtPrice, fetchJSON, showStatus } from './core.js';

let itemsApi; // provided by main.js

export function init({ itemsApi: injectedItems }) {
  itemsApi = injectedItems;

if (els.couponApply) {
    els.couponApply.addEventListener('click', applyCoupon);
  }
  if (els.couponCode) {
    els.couponCode.addEventListener('keydown', (e) => {
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
    if (!ln || ln.quantity <= 0) continue;
    m.set(String(ln.itemId), {
      quantity: Number(ln.quantity),
      unitPrice: Number(ln.unitPrice),
      totalPrice: Number(ln.totalPrice),
      discountedPrice: ln.discountedPrice != null ? Number(ln.discountedPrice) : null
    });
  }
  return m;
}

export function renderCart() {
  els.cartList.innerHTML = '';
  const frag = document.createDocumentFragment();
  let total = 0;

  for (const [itemId, line] of state.cart) {
    const item = state.items.find(x => String(x.id) === String(itemId));
    const el = els.tplCartLine.content.firstElementChild.cloneNode(true);

    const thumb = el.querySelector('.cart-thumb');
    if (item?.fileName && item?.mimeType?.startsWith('image/')) {
      thumb.src = `/api/v1/image/${encodeURIComponent(item.fileName)}`;
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
    const disc = el.querySelector('.cart-discount');
    if (line.discountedPrice != null && line.discountedPrice !== line.totalPrice) {
      disc.textContent = `discounted: ${fmtPrice(line.discountedPrice)}`;
      setHidden(disc, false);
    } else {
      setHidden(disc, true);
    }

    frag.appendChild(el);
  }

  els.cartList.appendChild(frag);
  
  // Paint credit (can be null if endpoint failed)
  if (state.creditBalance == null) {
    els.cartCredit.textContent = '—';
  } else {
    els.cartCredit.textContent = fmtPrice(state.creditBalance);
  }
    
  const overBudget = (state.creditBalance != null) && (total > state.creditBalance);

  // Paint total and over-budget state
  els.cartTotal.textContent = fmtPrice(total);
  if (overBudget) {
    els.cartTotal.classList.add('over-budget');
  } else {
    els.cartTotal.classList.remove('over-budget');
  }

  const isEmpty = state.cart.size === 0;
  
  els.buyBtn.disabled = isEmpty || overBudget;
  //setHidden(els.cartFooter, false);
  setHidden(els.cartEmpty, !isEmpty);

  // Repaint items so qty boxes appear/disappear
  itemsApi.renderItems();
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
  renderCart();
  // Persist debounced
  debouncedPersist();
}

function debounce(fn, ms) { let id; return (...args) => { clearTimeout(id); id = setTimeout(()=>fn(...args), ms); }; }
const debouncedPersist = debounce(persistCart, 300);

async function persistCart() {
  const items = [...state.cart.entries()].map(([itemId, line]) => ({ itemId, quantity: line.quantity }));
  try {
      const body = JSON.stringify({ idempotencyKey: state.idempotencyKey ?? null, lines: items });
      const updated = await fetchJSON('/api/v1/order/change', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body
    });
    if (updated?.lines) state.cart = toCartMap(updated.lines);
    else {
      const current = await fetchJSON('/api/v1/order/current');
      state.cart = toCartMap(current?.lines || []);
    }
    renderCart();
    showStatus(false);
  } catch (e) {
    showStatus(true, `Cart update failed: ${e?.message || e}`);
  }
}

async function applyCoupon() {
  const code = (els.couponCode?.value || '').trim();
  const userId = getUserId?.() ?? Number(localStorage.getItem('userId'));
  if (!userId || code.length < 3 || code.length > 64) {
    showStatus(true, 'Invalid coupon or user id');
    return;
  }
  try {
    els.couponApply.disabled = true;
    showStatus(true, 'Applying coupon…');
    await fetchJSON('/api/v1/coupon/redeem', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId, code }) // matches your Zod schema
    });
    // Refresh order to reflect discounts
    const current = await fetchJSON('/api/v1/order/current');
    state.cart = toCartMap(current?.lines || []);
    renderCart();
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
      lines,                                   // OrderSchema.lines
      idempotencyKey: state.idempotencyKey     // optional per schema
    };
    const res = await fetchJSON('/api/v1/order/buy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    // Assuming success: clear local cart and refresh from server (if any)
    state.cart.clear();
    const current = await fetchJSON('/api/v1/order/current').catch(() => null);
    if (current?.lines) state.cart = toCartMap(current.lines);
    renderCart();
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
