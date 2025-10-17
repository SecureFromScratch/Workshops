(function () {
   "use strict";

   const form = document.getElementById("connect-form");
   const input = document.getElementById("code");
   const submit = document.getElementById("submit");
   const msg = document.getElementById("msg");

   function setMsg(text, ok) {
      msg.textContent = text || "";
      msg.classList.toggle("error", !ok && !!text);
      msg.classList.toggle("ok", ok && !!text);
   }

   async function connectToWallet(code) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);

      try {
         const res = await fetch("/api/v1/wallet/balance/" + code, {
            signal: ctrl.signal
         });

         const isJson = res.headers.get("content-type")?.includes("application/json");
         const data = isJson ? await res.json() : null;
         if (!data) {
            throw new Error("Communication with server failed");
         }

         if (!res.ok) {
            const err = (data.error || data.message) || `Request failed with ${res.status}`;
            throw new Error(err);
         }

         console.log(data);
         if (typeof data.balance !== "number" || data.balance <= 0) {
            throw new Error("Wallet is empty. Try another Wallet.");
         }

         sessionStorage.setItem("walletCode", code);

         // Use assign to preserve history entry
         window.location.assign("/main.html");
      } finally {
         clearTimeout(t);
      }
   }

   form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMsg("");
      const code = input.value.trim();

      if (!code) {
         setMsg("Please enter your code.", false);
         input.focus();
         return;
      }

      submit.disabled = true;
      try {
         await connectToWallet(code);
      } catch (err) {
         setMsg(String(err.message || err), false);
      } finally {
         submit.disabled = false;
      }
   });
})();
