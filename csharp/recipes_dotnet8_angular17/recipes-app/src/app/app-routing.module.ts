import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipesCatalogComponent } from './recipes-catalog/recipes-catalog.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';


/*
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  { path: 'recipes', component: RecipesCatalogComponent },
  { path: 'add-recipe', component: AddRecipeComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'recipes', component: RecipesCatalogComponent, canActivate: [authGuard] },
  { path: 'add', component: AddRecipeComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
*/
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

