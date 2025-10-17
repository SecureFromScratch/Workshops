'use strict';

import { state, els, fetchJSON, showStatus, getUserId } from './core.js';
import * as Items from './items.js';
import * as Cart from './cart.js';
import * as Wallet from './wallet.js';

// Inject dependencies (break cycles)
Items.init({ state, els, cartApi: Cart });
Cart.init({ state, els, itemsApi: Items });
Wallet.init({ state, els, cartApi: Cart });

els.q.addEventListener('input', Items.applyFilters);
//els.onlyActive.addEventListener('change', Items.applyFilters);

(async function load() {
   showStatus(true, 'Loading…');
   const userId = parseInt(getUserId());
   try {
      const [items, order, credit] = await Promise.all([
         fetchJSON('/api/v1/items'), 
         fetchJSON('/api/v1/order/' + state.walletCode),
         fetchJSON('/api/v1/wallet/balance/' + state.walletCode).catch(() => ({ balance: null })),
         /*fetchJSON('/api/v1/wallet/balance', {
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ code }),
         })*/
      ]);
      if (!Array.isArray(items)) throw new Error('Unexpected items payload');
      state.items = items;
      state.cart = Cart.toCartMap(order?.lines || []);
      state.coupons = order?.coupons || [];
      console.log(state.coupons);

      state.creditBalance = typeof credit?.balance === 'number' ? credit.balance : null;

      Items.applyFilters();
      Cart.renderAll();
      showStatus(false);
   } catch (err) {
      console.error(err);
      showStatus(true, `Failed to load: ${err && err.message ? err.message : err}`);
   }
})();
