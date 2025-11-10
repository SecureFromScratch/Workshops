# Welcome

This lab is designed for **hands-on exploration of OWASP Juice Shop using only the browser’s Developer Tools** — no scanners, scripts, or external tools.  
Students will learn how attackers uncover client-side weaknesses through **source inspection, network tracing, storage analysis, and live code manipulation** directly within DevTools.

Refer to juice shop repo for installation: [Juice Shop Repo](https://github.com/juice-shop/juice-shop)

# The challanges
- scoreboard - gain access to the scoreboard
- Change others' orders
- Bypass the authentication by modifying in-memory state or calling exposed functions
- Manipulate authentication tokens stored on the client to change privileges or view protected content.
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


# Solutions 
In the next pages will show the solution one after anohter

- [Scoreboard](solutions/scoreboard.md)
- [Others' orders](solutions/othersorders.md)
- [Autneticaion bypass](solutions/authbypass.md)
- [Privilege Escalation](solutions/privilges.md)
- [XSS](solutions/xss.md)
