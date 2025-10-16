(function () {
   'use strict';

   const state = { items: [], filtered: [] };
   const els = {
      status: document.getElementById('status'),
      grid: document.getElementById('grid'),
      empty: document.getElementById('empty'),
      q: document.getElementById('q'),
      onlyActive: document.getElementById('onlyActive'),
      tpl: document.getElementById('item-card')
   };

   function setText(el, v) { el.textContent = v ?? ''; }
   function setHidden(el, hidden) { hidden ? el.setAttribute('hidden', '') : el.removeAttribute('hidden'); }
   function guessCurrency() {
      const loc = navigator.language || 'en-US';
      if (loc.startsWith('he') || loc.endsWith('-IL')) return 'ILS';
      if (loc.startsWith('en-GB')) return 'GBP';
      if (loc.startsWith('en')) return 'USD';
      return 'USD';
   }
   function formatPrice(n) {
      if (typeof n !== 'number') return '';
      try {
         return new Intl.NumberFormat(undefined, { style: 'currency', currencyDisplay: 'narrowSymbol', currency: guessCurrency() }).format(n);
      } catch { return n.toFixed(2); }
   }
   function formatDate(s) {
      if (!s) return '';
      const d = typeof s === 'string' || typeof s === 'number' ? new Date(s) : s;
      if (Number.isNaN(+d)) return '';
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
   }

   async function load() {
      showStatus(true, 'Loading…');
      try {
         const ctrl = new AbortController();
         const t = setTimeout(() => ctrl.abort(), 10000);
         const res = await fetch('/api/v1/items', { signal: ctrl.signal, headers: { 'accept': 'application/json' } });
         clearTimeout(t);
         if (!res.ok) throw new Error('HTTP ' + res.status);
         const data = await res.json();
         if (!Array.isArray(data)) throw new Error('Unexpected payload');
         state.items = data;
         applyFilters();
         console.log("turning off status")
         showStatus(false);
      } catch (err) {
         showStatus(true, `Failed to load: ${err && err.message ? err.message : err}`);
      } finally {
      }
   }

   function showStatus(show, msg) {
      console.log("status:", show, msg);
      if (show) {
         setText(els.status.lastElementChild, msg || '');
         els.status.hidden = false;
      } else {
         els.status.hidden = true;
      }
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
      render();
   }

   function render() {
      els.grid.innerHTML = '';
      if (state.filtered.length === 0) {
         els.grid.hidden = true;
         els.empty.hidden = false;
         return;
      }
      const frag = document.createDocumentFragment();
      for (const it of state.filtered) {
         const node = els.tpl.content.firstElementChild.cloneNode(true);
         setText(node.querySelector('[data-field=\"name\"]'), it.name);
         setText(node.querySelector('[data-field=\"category\"]'), it.category);
         setText(node.querySelector('[data-field=\"price\"]'), formatPrice(it.price));
         setText(node.querySelector('[data-field=\"createdAt\"]'), formatDate(it.createdAt));
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

         frag.appendChild(node);
      }
      els.grid.appendChild(frag);
      els.empty.hidden = true;
      els.grid.hidden = false;
   }

   els.q.addEventListener('input', applyFilters);
   els.onlyActive.addEventListener('change', applyFilters);
   load();
})();
