import { Component } from '@angular/core';
import { IRecipe } from './recipe.moudle';
import { RecipeService } from './recipe.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-recipes-catalog',
  templateUrl: './recipes-catalog.component.html',
  styleUrl: './recipes-catalog.component.css'
})
export class RecipesCatalogComponent {
  recipes: IRecipe[];
  filter: string ='';
  onFilterChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filter = inputElement.value; // Set the filter variable to the input value
  }
  constructor(private recipesSvc:RecipeService, private sanitizer: DomSanitizer) {
    this.recipes=[];
    /*this.recipes = [
      {
        Id: 1,
        Name: "Chocolate Cake",
        Instructions:
          "<ol>" +
          "<li>Preheat oven to 350°F (177°C).</li>" +
          "<li>In a large mixing bowl, combine flour, sugar, cocoa powder, baking soda, and salt.</li>" +
          "<li>Add eggs, milk, oil, and vanilla extract; mix until smooth.</li>" +
          "<li>Pour batter into a greased baking pan.</li>" +
          "<li>Bake for 30-35 minutes or until a toothpick inserted in the center comes out clean.</li>" +
          "<li>Let it cool before frosting or serving.</li>" +
          "</ol>",
        imagePath: "chocolate-cake.png",
      },
      {
        Id: 2,
        Name: "Orange Cake",
        Instructions:
          "<ol>" +
          "<li>Preheat oven to 350°F (177°C).</li>" +
          "<li>Combine flour, sugar, baking powder, and salt in a mixing bowl.</li>" +
          "<li>In a separate bowl, mix eggs, orange juice, oil, and zest from one orange.</li>" +
          "<li>Add wet ingredients to dry ingredients and stir until combined.</li>" +
          "<li>Pour into a greased baking pan.</li>" +
          "<li>Bake for 25-30 minutes, or until golden and set.</li>" +
          "<li>Let cool before serving.</li>" +
          "</ol>",
        imagePath: "orange-cake.png",
      },
      {
        Id: 3,
        Name: "Carrot Cake",
        Instructions:
          "<ol>" +
          "<li>Preheat oven to 350°F (177°C).</li>" +
          "<li>Mix flour, sugar, baking powder, baking soda, and cinnamon in a bowl.</li>" +
          "<li>In a separate bowl, combine eggs, oil, and vanilla extract.</li>" +
          "<li>Stir in grated carrots and crushed pineapple.</li>" +
          "<li>Combine wet and dry ingredients, then pour into a greased baking pan.</li>" +
          "<li>Bake for 35-40 minutes, or until a toothpick comes out clean.</li>" +
          "<li>Cool and top with cream cheese frosting.</li>" +
          "</ol>",
        imagePath: "carrot-cake.png",
      },
    ];
   */ 
  }

  getSanitizedContent(htmlContent: string | undefined): SafeHtml {
    // Use a default value for undefined content
    const safeContent = htmlContent ?? ''; // Use empty string if undefined
    return this.sanitizer.bypassSecurityTrustHtml(safeContent);
  }
  /*ngOnInit(){
    this.recipesSvc.getRecipes().subscribe(recipes=>
      this.recipes=recipes);

  }
  */
  ngOnInit(): void {
    this.loadRecipes(); // Initial fetch of recipes

    // Subscribe to the shared service to refresh when a new recipe is added
    this.recipesSvc.recipeAdded$.subscribe(() => {
      this.loadRecipes(); // Fetch updated recipes
    });
  }

  loadRecipes() {
    this.recipesSvc.getRecipes().subscribe(recipes=>
      this.recipes=recipes);
  }

  getImageUrl(recipe:IRecipe){
    return '/assets/images/' + recipe?.imagePath;
  }

  
  getFilteredRecipes() {
    const filter = this.filter.trim().toLowerCase(); // Trim whitespace and ensure lowercase for case-insensitive comparison
  
    return filter === ''
      ? this.recipes // If filter is empty, return all recipes
      : this.recipes.filter((recipe) => 
          recipe.name.toLowerCase().includes(filter) // Ensure recipe names are checked in lowercase
        );
  }
  

}
