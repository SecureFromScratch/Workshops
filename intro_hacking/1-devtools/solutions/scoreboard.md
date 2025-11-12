# Finding the scoreboard

## Expected result / verification 
Gain access to the scoreboard

## Hints
- Use the Pretty Print ({}) function in Sources to make minified JS readable.
- Search entire sources for keywords rather than scanning files manually.

## Steps (exact DevTools actions)
- View Page Source (right-click → View Page Source) and search for keywords like "score", "admin", or "hidden".
- Elements: inspect the DOM for hidden links or HTML comments that contain route hints.
- Sources: open bundled JS files and search (Ctrl+F) for strings like "scoreboard"
- Console: construct the discovered path (e.g., `/scoreboard`) and navigate `window.location="/scoreboard"` or fetch it via `fetch("/scoreboard")` to view content.
- If the route is guarded by client checks, inspect the guard logic in Sources and try modifying client state (localStorage/cookie) accordingly.

## final Solution
http://localhost:3000/#/score-board



