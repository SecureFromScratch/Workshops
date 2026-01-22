## Fixing Mass Assignment in Recipe Creation

### Goal

Ensure the client can only set **allowed fields** (name, description, photo). The server must always control:

* `CreatedBy`
* `Status`
* `CreateDate`
* `Id`

Right now the service accepts a full `Recipe` object, so a client can send `status` and bypass the workflow.

---

### Step 1: Create a request DTO

Create a new type that contains only fields the client is allowed to supply.

```csharp
public sealed class CreateRecipeRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public string? Photo { get; set; }
}
```

Best practice: keep DTOs separate from EF entities.

---

### Step 2: Change the service to accept the DTO

Do not accept `Recipe` from the API layer.

```csharp
public async Task<Recipe> CreateAsync(CreateRecipeRequest request, string currentUser)
{
    Recipe recipe = new Recipe
    {
        Name = request.Name,
        Description = request.Description,
        Photo = request.Photo,

        CreatedBy = currentUser,
        Status = RecipeStatus.Draft,
        CreateDate = DateTime.UtcNow
    };

    m_context.Recipes.Add(recipe);
    await m_context.SaveChangesAsync();
    return recipe;
}
```

Note: once you set `Status` and `CreateDate` explicitly, `OnCreate()` becomes optional.

---

### Step 3: Update the controller action signature

Bind the body to the DTO, not the entity.

Conceptually:

* Before: `Create(Recipe recipe)`
* After: `Create(CreateRecipeRequest request)`

---

