# Recipes API
---

## 0) Prereqs

* .NET SDK (8 or 9)
* Node.js LTS + npm
* Angular CLI: `npm i -g @angular/cli`

---

## 1) Create the solution skeleton

```bash
mkdir Recipes && cd Recipes
dotnet new sln -n Recipes
mkdir src
```

---

## 2) Create the API project (ASP.NET Core Web API)

```bash
cd src
dotnet new webapi -n Recipes.Api
dotnet sln ../Recipes.sln add Recipes.Api/Recipes.Api.csproj
```

Optional: remove Swagger later, but keep it for now.

### Add a health endpoint

Edit `src/Recipes.Api/Program.cs` and add:

```csharp
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
```

Run:

```bash
cd src

dotnet run --project Recipes.Api
```

Confirm:

* `https://localhost:<api-port>/health`

---

