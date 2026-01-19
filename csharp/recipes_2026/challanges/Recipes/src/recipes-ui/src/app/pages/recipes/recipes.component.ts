import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipesService, Recipe } from '../../services/recipes.service';
import { CommonModule } from '@angular/common';
// In your environment file or service
    const API_BASE = 'http://localhost:7000';


@Component({
    selector: 'app-recipes',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recipes.component.html'

})
export class RecipesComponent implements OnInit {
    recipes: Recipe[] = [];
    error = '';

    constructor(private recipesSvc: RecipesService, private router: Router) { }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.error = '';
        this.recipesSvc.getAll().subscribe({
            next: r => this.recipes = r,
            error: e => this.error = e?.error ?? 'Failed to load recipes'
        });
    }

    newRecipe(): void {
        this.router.navigateByUrl('/recipes/new');
    }

    edit(id: number): void {
        this.router.navigateByUrl(`/recipes/${id}`);
    }

    del(id: number): void {
        this.recipesSvc.delete(id).subscribe({
            next: () => this.load(),
            error: e => this.error = e?.error ?? 'Delete failed'
        });
    }
    
    // When displaying images, use the full URL:
    getImageUrl(photoPath: string): string {
        if (!photoPath) return '';
        if (photoPath.startsWith('http')) return photoPath;
        return API_BASE + photoPath;
    }
}
