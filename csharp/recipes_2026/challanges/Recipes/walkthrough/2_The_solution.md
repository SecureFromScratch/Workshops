# Preventing CSRF 
To enable CSRF protection in BFF add the following code to the Program.cs

```csharp 
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});


builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = "XSRF-TOKEN"; 
    options.Cookie.HttpOnly = false; 
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

```
Remove the following code
```
builder.Services.AddControllersWithViews();
```

The Angular part already exists.
Can you identify what the Angular code actually does?
On one hand, without it the CSRF solution will not work.
On the other hand, by itself it does nothing.
