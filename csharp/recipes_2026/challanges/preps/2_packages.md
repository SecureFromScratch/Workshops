## Packages

### 1) Install the NuGet packages

Open Visual code terminal:

#### Recipes.APi

```bash
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package AWSSDK.SecretsManager --version 4.0.4.3
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Azure.AI.OpenAI --version 2.1.0
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.OpenApi --version 8.0.16
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.Tools --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package OpenAI --version 2.8.0
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Swashbuckle.AspNetCore --version 6.6.2
```

#### Recipes.Bff
```
dotnet add ./src/Recipes.Bff/Recipes.Bff.csproj package Yarp.ReverseProxy --version 2.3.0
dotnet restore
```

### 2) Install the Angular packages

Paste this from your Angular project folder (the one that has `package.json`):

```bash
npm install
```

