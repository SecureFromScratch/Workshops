// this is code for the browser's console
// update appIp with your machine's ip,
// update aviSessionId with Avi's sessionId (use devtools to see it in the sessionId cookie)
// update the imageUrl according to the URL you want to use
const appIp = "<!!!Put Machine's IP Here!!!>";
const aviSessionId = "<!!!Copy-Paste Avi's sessionId!!!>";
const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Red_Velvet_Cake_Waldorf_Astoria.jpg/345px-Red_Velvet_Cake_Waldorf_Astoria.jpg";
const r = fetch(`http://${appIp}:5173/api/addRecipeWithUrl`, {
    headers: { 'Content-Type': 'application/json', 
            'Cookie': `sessionId=${aviSessionId}` },
    method: "POST", 
    body: JSON.stringify( {
        "name": "Velvet Cake",
        "instructions": "ingredients: bla bla bla bla",
        "imageUrl": imageUrl,
        "isPremium": false
    })
}); 
const r2 = await r;
r2;
