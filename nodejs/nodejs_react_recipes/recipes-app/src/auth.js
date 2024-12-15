const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    window.location.href = "/login"; // Redirect to login on 401
  }
  return response;
};
