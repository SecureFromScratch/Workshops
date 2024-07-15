import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RecipesCatalogComponent } from './recipes-catalog/recipes-catalog.component';
import { SiteHeaderComponent } from './site-header/site-header.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { EditorModule } from '@tinymce/tinymce-angular';
//import { CsrfInterceptor } from './csrf-interceptor.service'; // Adjust path if needed
import { CookieService } from 'ngx-cookie-service';





const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' }, // Default to the recipes component
  { path: 'recipes', component: RecipesCatalogComponent }, // Route for the recipes component
  { path: 'add-recipe', component: AddRecipeComponent }, // Route for the add recipe component
];

@NgModule({
  declarations: [
    AppComponent,    
    RecipesCatalogComponent,
    SiteHeaderComponent,
    AddRecipeComponent, 
    
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,    
    EditorModule
    
  ],


  exports: [RouterModule],
  providers: [    
    provideAnimationsAsync()   
    
  ],
  

  bootstrap: [AppComponent]
})
export class AppModule { }


