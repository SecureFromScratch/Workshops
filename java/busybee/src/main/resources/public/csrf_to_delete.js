function getCookie(name) {
    return document.cookie
      .split("; ")
      .find(row => row.startsWith(name + "="))
      ?.split("=")[1];
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = getCookie("XSRF-TOKEN");
    const field = document.getElementById("csrfTokenField");
  
    if (csrfToken && field) {
      field.value = decodeURIComponent(csrfToken);
      console.log("✅ CSRF token set from cookie:", csrfToken);
    } else {
      console.warn("❌ CSRF token not found in cookies");
    }
  });
  