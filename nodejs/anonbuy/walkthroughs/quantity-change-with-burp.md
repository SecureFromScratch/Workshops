Download and Install Burp Community
Open Burp
Open a Browser from within Burp
Surf to AnonBuy
Use a wallet code from the "Wallet" table or seed.js:
    SELECT * FROM "Wallet";
    -or- 
    prisma/seed.db, search for calls to fillWallet(...)
    First parameter is the wallet code.
    -or-
    Use "demo" as the wallet code
Make sure you've reached the main page (main.html).
Add an item to the shopping cart.
In Burp: Turn Interception On.
Add another item to the shopping cart.
Look in Burp - did it catch the request?
Change the quantity field in the JSON
Forward request to the website
Enjoy the result :)
