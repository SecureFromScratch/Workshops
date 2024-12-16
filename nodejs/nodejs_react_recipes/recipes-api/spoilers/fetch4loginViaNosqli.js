const responsePromise = fetch(`/api/login`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: { "$gt": "Avi" } }),
});
const response = await responsePromise;
const data = await response.json();
data;
