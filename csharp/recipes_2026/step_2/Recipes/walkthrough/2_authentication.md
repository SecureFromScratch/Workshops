
# Authentication, the API part
In this tutorial we'll use the secret manager for authentication.

## Install entity framework

### Core EF
```
dotnet add package Microsoft.EntityFrameworkCore --version 8.*
```

### Provider (SQL Server)
```
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.*
```

### Tools (needed for migrations)
```
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.*
```

```
dotnet restore
```

-------------

## Code Controller, service and models for handling users

From the repo, copy the API files into:

* Config:

  * `Api/appsettings.json`  (no secrets – use repo version)
* Models:

  * `Api/Models/AppUser.cs`
* Data:

  * `Api/Data/AppDbContext.cs`
* Services:

  * `Api/Services/IUserService.cs`
  * `Api/Services/UserService.cs`
* Controllers:

  * `Api/Controllers/AccountController.cs`
  * `Api/Controllers/AdminController.cs`
* Update Program.cs:

```csharp
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
```

----
migrate

```
dotnet ef migrations add InitialCreate
dotnet ef database update --connection "Server=localhost,14333;Database=Recipes;User Id=recipes_admin;Password=StrongP4ssword123;TrustServerCertificate=true;"

```

## Test
1. Try to Regsiter
2. Try to Login
3. Authenticate, did you get an error? "JWT_SECRET is not set"
4. Put the JWT secret in the secret manager and try again.
5. Use the swagger authorize button to authenticate using the JWT.