# Adding items
## API:
   ### Adding data layer, model
   You can copy the following files from repo:
   - Recipes.Api/Models/Recipe.cs
   - Recipes.Api/Models/RecipeStatus.cs
   ### Update entity framework
   ``` bash
   dotnet ef migrations add AddNewModels
   dotnet ef database update
   ```
   ### Adding CRUD
   You can copy the following files from repo:
   - Recipes.Api/Controllers/RecipesController.cs
   - Recipes.Api/Services/RecipesService.cs
   - Recipes.Api/Services/IRecipesService.cs

## BFF
   ### FACAD
   Add a facad that call the api's CRUD
   You can copy the following files from repo:
   - Recipes.Bff/Controllers/RecipesController.cs
   ### Add DelegatingHandler
   Add a DelegatingHandler that sends to the API the jwt after sunsequenting calls after login.
   You can copy the following files from repo:
   - Recipes.Bff/Extensions/ApiAccessTokenHandler.cs
   and resiter the extension in Program.cs
   ```csharp
   builder.Services.AddHttpContextAccessor();
   builder.Services.AddTransient<ApiAccessTokenHandler>();

   builder.Services
    .AddHttpClient("Api", client =>
    {
        client.BaseAddress = new Uri(apiAddress);
    })
    .AddHttpMessageHandler<ApiAccessTokenHandler>();
   ```
