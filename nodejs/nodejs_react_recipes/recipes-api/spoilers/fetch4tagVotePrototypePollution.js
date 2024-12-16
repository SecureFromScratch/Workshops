// this is code for the browser's console
// update recipeId with a recipeId (hint: find the /recipes request+response in the Network tab of the browser's devtools)
const recipeId = "<!!!Put a recipeId here!!!>";
const r = fetch(`/api/tagVote`, {
    headers: { 'Content-Type': 'application/json' },
    method: "POST", 
    body: JSON.stringify( {
        recipeId: recipeId,
        votes: { isSubscribed: true },
    })
}); 
const r2 = await r;
r2;
