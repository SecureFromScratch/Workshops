import { Routes } from '@angular/router';
import { SetupComponent } from './pages/setup/setup.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { RecipesComponent } from './pages/recipes/recipes.component';
import { RecipeComponent } from './pages/recipes/recipe.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';


export const routes: Routes = [
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'recipes', component: RecipesComponent, canActivate: [AuthGuard] },
  { path: 'recipes/new', component: RecipeComponent },
  { path: 'recipes/:id', component: RecipeComponent },


  // default route
  { path: '', redirectTo: 'register', pathMatch: 'full' },

  // catch-all
  { path: '**', redirectTo: 'register' }
];