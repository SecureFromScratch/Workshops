import { doubleCsrf } from "csrf-csrf";
import { randomUUID } from 'crypto';

const doubleCsrfSecrets = [randomUUID()]; // This is a simplified solution - it changes every reboot of the server... Also - should add secret rotation.
const doubleCsrfOptions = {
  getSecret: (req)=>doubleCsrfSecrets,
  cookieName: 
    ((process.env.NODE_ENV === 'production') ? '__Host' : '') 
    + "-psifi.x-csrf-token", // The name of the cookie to be used, recommend using Host prefix, as is the default: __Host-psifi.x-csrf-token
  cookieOptions: {
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === 'production', // Secure in production
  },
};

export const {
  //invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  //validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);

/*export {
    generateToken,
    doubleCsrfProtection,
}*/
