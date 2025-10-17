'use strict';
import { state, els, setHidden, fmtPrice, fetchJSON, showStatus } from './core.js';

let cartApi; // provided by main.js

export function init({ cartApi: injectedCart }) {
  cartApi = injectedCart;

  if (els.walletMergeBtn)  els.walletMergeBtn.addEventListener('click', openWalletMerge);
  if (els.walletMergeCancel) els.walletMergeCancel.addEventListener('click', closeWalletMerge);
  if (els.walletMergeOk) els.walletMergeOk.addEventListener('click', doWalletMerge);
  if (els.walletMergeDlg) {
    // enable/disable OK based on input content
    els.walletMergeCode.addEventListener('input', () => {
      els.walletMergeOk.disabled = !els.walletMergeCode.value.trim();
    });
    // ESC closes (native <dialog> supports cancel)
    els.walletMergeDlg.addEventListener('cancel', (e) => { e.preventDefault(); closeWalletMerge(); });
  }
}

export function openWalletMerge() {
  if (!els.walletMergeDlg) return;
  els.walletMergeCode.value = '';
  els.walletMergeOk.disabled = true;
  try { els.walletMergeDlg.showModal(); } catch { /* in case dialog is unsupported */ }
  queueMicrotask(() => els.walletMergeCode.focus());
}

export function closeWalletMerge() {
  if (!els.walletMergeDlg) return;
  try { els.walletMergeDlg.close(); } catch {}
}

export async function doWalletMerge() {
  const fromCode = (els.walletMergeCode?.value || '').trim();
  const toCode = state.walletCode || state.WalletCode || localStorage.getItem('walletCode');
  if (!fromCode) return;
  if (!toCode) { setStatus(true, 'No destination wallet code'); return; }

  try {
    els.walletMergeOk.disabled = true;
    showStatus(true, 'Merging funds…');

    const res = await fetch('/api/v1/wallet/withdraw', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ to: toCode, from: fromCode })
    });
    const data = await res.json(); // { balance: 450 }
    if (!res.ok) throw new Error((data && data.message) || ('HTTP ' + res.status));

    // Update credit balance and UI
    if (typeof data?.balance === 'number') {
      state.creditBalance = data.balance;
    }

    // Recompute Buy button enabled state (uses your existing renderCart logic)
    cartApi.renderTotals();

    showStatus(false);
    closeWalletMerge();
  } catch (e) {
    showStatus(true, `Merge failed: ${e?.message || e}`);
  } finally {
    els.walletMergeOk.disabled = !els.walletMergeCode.value.trim();
  }
}
