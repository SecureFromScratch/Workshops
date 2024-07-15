import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IRecipe } from './recipe.moudle';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private updateSubject = new Subject<void>(); // Emits when a recipe is added

  // Observable that components can subscribe to
  recipeAdded$ = this.updateSubject.asObservable();

  // Method to notify subscribers
  
  
  constructor(private http: HttpClient) { }

  notifyRecipeAdded() {
    this.updateSubject.next(); // Trigger an event
  }
  //return this.http.get<IRecipe[]>('/api/Recipes')
  getRecipes():Observable<IRecipe[]>{    
    return this.http.get<IRecipe[]>('http://localhost:5187/Recipes',{
      withCredentials: true,
    })
    
  }

  addRecipe(formData: FormData): Observable<any> {
    // Send a POST request with FormData
    return this.http.post('http://localhost:5187/Recipes', formData, {
      headers: {
        // No need to set 'Content-Type' as it should be automatically handled
        // Avoid setting 'Content-Type' to 'multipart/form-data' manually
      }
    });
}
}



