import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipesCatalogComponent } from './recipes-catalog/recipes-catalog.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';



const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  { path: 'recipes', component: RecipesCatalogComponent },
  { path: 'add-recipe', component: AddRecipeComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

