CookieOptions options = new CookieOptions
{
    Expires = DateTime.Now.AddDays(1),
    HttpOnly = true,
    //Secure = true
};

Response.Cookies.Append("user", "JohnDoe", options);
