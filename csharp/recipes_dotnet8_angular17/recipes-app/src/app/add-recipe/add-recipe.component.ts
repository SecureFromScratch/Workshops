import { Component, ViewChild, ElementRef } from '@angular/core';
import { RecipeService } from '../recipes-catalog/recipe.service';
import { IRecipe } from '../recipes-catalog/recipe.moudle';



@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css']
})
export class AddRecipeComponent {
  recipe: IRecipe = {
    id: 0,
    name: '',
    instructions: '',
    imagePath: ''
  };

  selectedFile: File | null = null;
  successMessage: string | null = null;

  // Access the file input through the template reference
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  constructor(private recipesSvc: RecipeService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  addRecipe() {
    const formData = new FormData();

    formData.append('name', this.recipe.name);
    formData.append('instructions', this.recipe.instructions);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.recipesSvc.addRecipe(formData).subscribe(
      (response) => {
        this.successMessage = 'Recipe added successfully!';
        this.resetForm(); // Reset form after success
        this.recipesSvc.notifyRecipeAdded();
      },
      (error) => {
        console.error('Error adding recipe:', error);
        this.successMessage = 'Failed to add recipe';
      }
    );
    
  }

  resetForm() {
    // Reset recipe data and selected file
    this.recipe = {
      id: 0,
      name: '',
      instructions: '',
      imagePath: ''
    };
    this.selectedFile = null;

    // Reset the file input field by setting its value to an empty string
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the file input
    }
  }
}
