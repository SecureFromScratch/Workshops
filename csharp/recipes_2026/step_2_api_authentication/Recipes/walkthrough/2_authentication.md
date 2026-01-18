
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

----
migrate

```
dotnet ef migrations add InitialCreate
dotnet ef database update --connection "Server=localhost,14333;Database=Recipes;User Id=recipes_admin;Password=StrongP4ssword123;TrustServerCertificate=true;"

```

----
## Dealing with the JWT secret 

1. Put JWT config in Secret Manager (one secret)

  Create the secret in LocalStack:
```bash
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
  --name recipes/dev/jwt-config \
  --secret-string '{"Secret":"ThisIsAStrongJwtSecretKey1234567","Issuer":"recipes-api","Audience":"recipes-client"}'
```
Or Update the secret
```bash
aws --endpoint-url=http://localhost:4566 secretsmanager put-secret-value \
  --secret-id recipes/dev/jwt-config \
  --secret-string '{"Secret":"ThisIsAStrongJwtSecretKey1234567","Issuer":"recipes-api","Audience":"recipes-client"}'
```

2. Update configuration: 
   In `appsettings.json` (already have the section, just add a key):

```json
{
  "Secrets": {
    "ServiceUrl": "http://localhost:4566",
    "Region": "us-east-1",
    "DbConnectionSecretName": "recipes/dev/app-db-connection",
    "JwtConfigSecretName": "recipes/dev/jwt-config"
  }
}
```

---

3. Update `SecretsConfig` helper 

    Install the JwtBearer package
    ```bash
    dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.*
    ```

    Add funcionalty that gets the JWT.

---

4. Implement JWT setup in an extension method

    Copy `JwtAuthExtensions.cs` from repo.

---

5. Copy the updated `Program.cs` from repo.





## Test
1. Try to Regsiter
2. Try to Login
3. Copy the JWT
4. Use the swagger authorize button to authenticate using the JWT.
5. Access the me endpoint to verify that authentcation succeded. 
