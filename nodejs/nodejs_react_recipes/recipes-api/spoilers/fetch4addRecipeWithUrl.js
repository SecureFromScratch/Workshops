// this is code for the browser's console
// update the imageUrl according to the URL you want to use
const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Red_Velvet_Cake_Waldorf_Astoria.jpg/345px-Red_Velvet_Cake_Waldorf_Astoria.jpg";
const r = fetch(`/api/addRecipeWithUrl`, {
    headers: { 'Content-Type': 'application/json' },
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
