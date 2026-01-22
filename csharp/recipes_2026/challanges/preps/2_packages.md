## Packages

### 1) Install the NuGet packages

Open Visual code terminal:

#### Recipes.APi

```bash
cd cd src/Recipes.Api/
dotnet add ./Recipes.Api/Recipes.Api.csproj package AWSSDK.SecretsManager --version 4.0.4.3
dotnet add ./Recipes.Api/Recipes.Api.csproj package Azure.AI.OpenAI --version 2.1.0
dotnet add ./Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.23
dotnet add ./Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.OpenApi --version 8.0.16
dotnet add ./Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore --version 8.0.23
dotnet add ./Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.23
dotnet add ./Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.Tools --version 8.0.23
dotnet add ./Recipes.Api/Recipes.Api.csproj package OpenAI --version 2.8.0
dotnet add ./Recipes.Api/Recipes.Api.csproj package Swashbuckle.AspNetCore --version 6.6.2
dotnet restore
```

#### Recipes.Bff
```
cd ../Recipes.Bff/
dotnet add ./Recipes.Bff/Recipes.Bff.csproj package Yarp.ReverseProxy --version 2.3.0
dotnet restore
```

### 2) Install the Angular packages

Paste this from your Angular project folder (the one that has `package.json`):

```bash
npm install
```






## Packages
1. **Install the following nugets**

Project 'Recipes.Api' has the following package references
   [net8.0]: 
```
| Package                                             | Version |
|-----------------------------------------------------|----------|
| AWSSDK.SecretsManager                               | 4.0.4.3  |
| Azure.AI.OpenAI                                     | 2.1.0    |
| Microsoft.AspNetCore.Authentication.JwtBearer       | 8.0.23   |
| Microsoft.AspNetCore.OpenApi                        | 8.0.16   |
| Microsoft.EntityFrameworkCore                       | 8.0.23   |
| Microsoft.EntityFrameworkCore.SqlServer             | 8.0.23   |
| Microsoft.EntityFrameworkCore.Tools                 | 8.0.23   |
| OpenAI                                              | 2.8.0    |
| Swashbuckle.AspNetCore                              | 6.6.2    |

```


Project 'Recipes.Bff' has the following package references
   [net8.0]: 
   Top-level Package        Requested   Resolved
   > Yarp.ReverseProxy      2.3.0       2.3.0   

2. **Install the angular packages for this solution**
