(function () {
   "use strict";

   const form = document.getElementById("redeem-form");
   const input = document.getElementById("code");
   const submit = document.getElementById("submit");
   const msg = document.getElementById("msg");

   function setMsg(text, ok) {
      msg.textContent = text || "";
      msg.classList.toggle("error", !ok && !!text);
      msg.classList.toggle("ok", ok && !!text);
   }

   async function postRedeem(code) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);

      try {
         const res = await fetch("/api/v1/giftcard/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ code }),
            signal: ctrl.signal
         });

         const isJson = res.headers.get("content-type")?.includes("application/json");
         const data = isJson ? await res.json() : null;

         if (!res.ok) {
            const err = (data && (data.error || data.message)) || `Request failed with ${res.status}`;
            throw new Error(err);
         }

         console.log(data);
         if (!data || typeof data.userId !== "number") {
            throw new Error("Missing user Id");
         }
         if (!data || typeof data.next !== "string" || data.next.trim() === "") {
            throw new Error("Missing redirect URL");
         }

         localStorage.setItem("userId", data.userId.toString());

         // Use assign to preserve history entry
         window.location.assign(data.next);
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
         await postRedeem(code);
      } catch (err) {
         setMsg(String(err.message || err), false);
      } finally {
         submit.disabled = false;
      }
   });
})();
