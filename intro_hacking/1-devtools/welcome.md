# Welcome

This lab is designed for **hands-on exploration of OWASP Juice Shop using only the browser’s Developer Tools** — no scanners, scripts, or external tools.  
Students will learn how attackers uncover client-side weaknesses through **source inspection, network tracing, storage analysis, and live code manipulation** directly within DevTools.

go to 
http://104.198.50.184:3000/#/

or
Refer to juice shop repo for installation: [Juice Shop Repo](https://github.com/juice-shop/juice-shop)

# The challanges
- Scoreboard - gain access to the scoreboard
- View others' orders
- Access the admin pabel
- Look for confidental documents
- XSS - Find a place where user input is reflected into the DOM without sanitization and achieve JS execution in the page context.

## General Hints
- View source
- Check the cookies
- Inspect the local stroage
- Check the source control
- Check the console
- Check the netwrok tab
- Debug (in the browser)
- Use the Pretty Print ({}) function in Sources to make minified JS readable.

## How edit and resend requests 

### In Chrome DevTools

1. Open **Network** tab.
2. Find the request you want to modify.
3. Right-click it → **Copy → Copy as fetch**.
4. Go to the **Console**, paste it, edit any part (URL, headers, body), and press **Enter** to resend.

### In Firefox Developer Tools

1. Open **Network** tab.
2. Right-click the request → **Edit and Resend** (directly available).
3. Modify any header, method, or body.
4. Click **Send**.


# Solutions 
In the next pages will show the solution one after anohter

- [Scoreboard](solutions/scoreboard.md)
- [Others' orders](solutions/othersorders.md)
- [Admin](solutions/admin.md)
- [Confidential Information](solutions/sensitive.md)
- [XSS](solutions/xss.md)
