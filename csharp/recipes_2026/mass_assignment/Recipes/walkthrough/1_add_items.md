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
   No need to add anything becasue it's a proxy

## Angular
Add Recipes UI
Update routes
Recirect to Recipes UI after login
