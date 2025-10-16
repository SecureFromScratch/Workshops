'use strict';
import { state, els, setText, setHidden, fmtPrice, fmtDate } from './core.js';

let cartApi; // provided by main.js

export function init({ cartApi: injectedCart }) {
  cartApi = injectedCart;
}

export function applyFilters() {
  const q = els.q.value.trim().toLowerCase();
  //const onlyActive = els.onlyActive.checked;
  const filtered = state.items.filter(it => {
    const hit = !q || String(it.name || '').toLowerCase().includes(q) || String(it.category || '').toLowerCase().includes(q);
    //const act = !onlyActive || Boolean(it.active);
    return hit; //&& act;
  });
  state.filtered = filtered;
  renderItems();
}

export function renderItems() {
  els.grid.innerHTML = '';
  if (state.filtered.length === 0) {
    setHidden(els.grid, true);
    setHidden(els.empty, false);
    return;
  }
  const frag = document.createDocumentFragment();
  for (const it of state.filtered) {
    const node = els.tplItem.content.firstElementChild.cloneNode(true);

    // Basic fields
    setText(node.querySelector('[data-field="name"]'), it.name);
    setText(node.querySelector('[data-field="category"]'), it.category);
    setText(node.querySelector('[data-field="price"]'), fmtPrice(it.price));
    setText(node.querySelector('[data-field="createdAt"]'), fmtDate(it.createdAt));

    /*// Active badge
    const activeEl = node.querySelector('[data-field="active"]');
    activeEl.classList.toggle('active', !!it.active);
    activeEl.classList.toggle('inactive', !it.active);
    setText(activeEl, it.active ? 'Active' : 'Inactive');
    */
   
    // File metadata
    const hasFile = it.fileName || it.fileSize || it.mimeType;
    const details = node.querySelector('[data-field="fileDetails"]');
    setHidden(details, !hasFile);
    if (hasFile) {
      setText(node.querySelector('[data-field="fileName"]'), it.fileName ?? '—');
      setText(node.querySelector('[data-field="fileSize"]'), it.fileSize != null ? `${it.fileSize} bytes` : '—');
      setText(node.querySelector('[data-field="mimeType"]'), it.mimeType ?? '—');
    }

    // Image preview via /api/v1/image/{filename}
    const imgWrap = node.querySelector('[data-field="imageWrap"]');
    const img = node.querySelector('[data-field="image"]');
    const fname = (it.fileName || '').trim();
    const looksImage = typeof it.mimeType === 'string' && it.mimeType.startsWith('image/');
    if (fname && looksImage) {
      img.src = `/api/v1/image/${encodeURIComponent(fname)}`;
      img.alt = it.name ? `${it.name} image` : 'item image';
      setHidden(imgWrap, false);
      img.addEventListener('error', () => setHidden(imgWrap, true), { once: true });
    } else {
      setHidden(imgWrap, true);
    }

    // Qty control if in cart
    const qtyWrap = node.querySelector('[data-field="qtyWrap"]');
    const qtyInput = node.querySelector('[data-field="qty"]');
    const inCart = state.cart.get(String(it.id));
    if (inCart) {
      qtyInput.value = String(inCart.quantity);
      setHidden(qtyWrap, false);
    } else {
      setHidden(qtyWrap, true);
    }

    // Interactions
    node.addEventListener('click', (ev) => {
      if (ev.target instanceof HTMLInputElement) return;
      if (!state.cart.has(String(it.id))) {
        cartApi.updateCartItem(it.id, 1);
      }
    });
    qtyInput.addEventListener('input', () => {
      const val = Math.max(0, Number(qtyInput.value || 0) | 0);
      cartApi.updateCartItem(it.id, val);
    });

    frag.appendChild(node);
  }
  els.grid.appendChild(frag);
  setHidden(els.empty, true);
  setHidden(els.grid, false);
}
