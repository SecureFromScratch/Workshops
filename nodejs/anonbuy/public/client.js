'use strict';

import { state, els, fetchJSON, showStatus, getUserId } from './core.js';
import * as Items from './items.js';
import * as Cart from './cart.js';

// Inject dependencies (break cycles)
Items.init({ state, els, cartApi: Cart });
Cart.init({ state, els, itemsApi: Items });

els.q.addEventListener('input', Items.applyFilters);
//els.onlyActive.addEventListener('change', Items.applyFilters);

(async function load() {
   showStatus(true, 'Loading…');
   const userId = parseInt(getUserId());
   try {
      const [items, order, credit] = await Promise.all([
         fetchJSON('/api/v1/items'), 
         fetchJSON('/api/v1/order/' + state.idempotencyKey),
         fetchJSON('/api/v1/wallet/balance/' + userId).catch(() => ({ balance: null }))
      ]);
      if (!Array.isArray(items)) throw new Error('Unexpected items payload');
      state.items = items;
      state.cart = Cart.toCartMap(order?.lines || []);
      state.creditBalance = typeof credit?.balance === 'number' ? credit.balance : null;

      Items.applyFilters();
      Cart.renderCart();
      showStatus(false);
   } catch (err) {
      showStatus(true, `Failed to load: ${err && err.message ? err.message : err}`);
   }
})();

/*   function toCartMap(lines) {
      const m = new Map();
      for (const ln of lines) {
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

   function applyFilters() {
      const q = els.q.value.trim().toLowerCase();
      const onlyActive = els.onlyActive.checked;
      const filtered = state.items.filter(it => {
         const hit = !q || String(it.name || '').toLowerCase().includes(q) || String(it.category || '').toLowerCase().includes(q);
         const act = !onlyActive || Boolean(it.active);
         return hit && act;
      });
      state.filtered = filtered;
      renderItems();
   }

   function renderItems() {
      els.grid.innerHTML = '';
      if (state.filtered.length === 0) {
         els.grid.hidden = true;
         els.empty.hidden = false;
         return;
      }
      const frag = document.createDocumentFragment();
      for (const it of state.filtered) {
         const node = els.tplItem.content.firstElementChild.cloneNode(true);
         setText(node.querySelector('[data-field=\"name\"]'), it.name);
         setText(node.querySelector('[data-field=\"category\"]'), it.category);
         setText(node.querySelector('[data-field=\"price\"]'), fmtPrice(it.price));
         setText(node.querySelector('[data-field=\"createdAt\"]'), fmtDate(it.createdAt));
         const activeEl = node.querySelector('[data-field=\"active\"]');
         activeEl.classList.toggle('active', !!it.active);
         activeEl.classList.toggle('inactive', !it.active);
         setText(activeEl, it.active ? 'Active' : 'Inactive');

         const hasFile = it.fileName || it.fileSize || it.mimeType;
         const details = node.querySelector('[data-field=\"fileDetails\"]');
         details.hidden = !hasFile;
         if (hasFile) {
            setText(node.querySelector('[data-field=\"fileName\"]'), it.fileName ?? '—');
            setText(node.querySelector('[data-field=\"fileSize\"]'), it.fileSize != null ? `${it.fileSize} bytes` : '—');
            setText(node.querySelector('[data-field=\"mimeType\"]'), it.mimeType ?? '—');
         }

         // Image preview via /api/v1/image/{filename}
         const imgWrap = node.querySelector('[data-field="imageWrap"]');
         const img = node.querySelector('[data-field="image"]');
         const fname = (it.fileName || '').trim();
         console.log("fname=", fname, "mimetype=", it.mimeType);
         const looksImage = typeof it.mimeType === 'string' && it.mimeType.startsWith('image/');
         if (fname && looksImage) {
            img.src = `/api/v1/image/${encodeURIComponent(fname)}`;
            img.alt = it.name ? `${it.name} image` : 'item image';
            setHidden(imgWrap, false);
            // Optional: handle failed image load gracefully
            img.addEventListener('error', () => {
               setHidden(imgWrap, true);
            }, { once: true });
         } else {
            setHidden(imgWrap, true);
         }


         // Qty control (only if in cart)
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
            // ignore clicks on inputs
            if (ev.target instanceof HTMLInputElement) return;
            if (!state.cart.has(String(it.id))) {
            updateCartItem(it.id, 1);
            }
         });
         qtyInput.addEventListener('input', () => {
            const val = Math.max(0, Number(qtyInput.value || 0) | 0);
            updateCartItem(it.id, val);
         });
                  
         frag.appendChild(node);
      }
      els.grid.appendChild(frag);
      els.empty.hidden = true;
      els.grid.hidden = false;
   }

   function renderCart() {
      els.cartList.innerHTML = '';
      const frag = document.createDocumentFragment();
      let total = 0;

      for (const [itemId, line] of state.cart) {
         const item = state.items.find(x => String(x.id) === String(itemId));
         const el = els.tplCartLine.content.firstElementChild.cloneNode(true);

         // thumb
         const thumb = el.querySelector('.cart-thumb');
         if (item?.fileName && item?.mimeType?.startsWith('image/')) {
            thumb.src = `/api/v1/image/${encodeURIComponent(item.fileName)}`;
            thumb.alt = item.name ? `${item.name} image` : 'item image';
         } else {
            thumb.removeAttribute('src'); // blank placeholder
         }

         // text
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
      els.cartTotal.textContent = fmtPrice(total);
      const isEmpty = state.cart.size === 0;
      setHidden(els.cartFooter, isEmpty);
      setHidden(els.cartEmpty, !isEmpty);

      // Repaint items side so qty boxes appear/disappear
      renderItems();
   }

   function updateCartItem(itemId, quantity) {
      const key = String(itemId);
      if (quantity <= 0) state.cart.delete(key);
      else {
         const it = state.items.find(x => String(x.id) === key);
         const unit = it?.price ?? state.cart.get(key)?.unitPrice ?? 0;
         state.cart.set(key, { quantity, unitPrice: unit, totalPrice: unit * quantity, discountedPrice: null });
      }
      // Optimistic UI
      renderCart();
      // Persist with debounce
      debouncedPersist();
   }

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
         // If API returns updated order, resync to capture discounts
         if (updated?.lines) state.cart = toCartMap(updated.lines);
         else {
            // Fallback: hard refresh
            const current = await fetchJSON('/api/v1/order/current');
            state.cart = toCartMap(current?.lines || []);
         }
         renderCart();
         showStatus(false);
      } catch (e) {
         showStatus(true, `Cart update failed: ${e?.message || e}`);
      }
   }

   function debounce(fn, ms) {
      let id; return (...args) => { clearTimeout(id); id = setTimeout(()=>fn(...args), ms); };
   }


   load();
})();
*/