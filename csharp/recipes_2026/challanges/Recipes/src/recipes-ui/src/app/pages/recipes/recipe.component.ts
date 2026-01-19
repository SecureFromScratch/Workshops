import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService, RecipeCreateUpdate, RecipeStatus } from '../../services/recipes.service';
import { FormsModule } from '@angular/forms';  // Add this import
import { CommonModule } from '@angular/common';
import { EditorComponent } from '@tinymce/tinymce-angular';

type PhotoMode = 'url' | 'upload';

@Component({
    selector: 'app-recipe',
    standalone: true,
    imports: [CommonModule, FormsModule, EditorComponent],  // Add FormsModule here

    templateUrl: './recipe.component.html'
})
export class RecipeComponent implements OnInit {
    id: number | null = null;

    dto: RecipeCreateUpdate = {
        name: '',
        description: '',
        photo: '',
        status: RecipeStatus.Draft
    };

    RecipeStatus = RecipeStatus;

    photoMode: PhotoMode = 'url';
    selectedFile: File | null = null;
    imagePreview: string | null = null;  // Add this property

    error = '';

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private recipesSvc: RecipesService
    ) { }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (!idParam || idParam === 'new') return;

        this.id = Number(idParam);
        this.recipesSvc.getById(this.id).subscribe({
            next: r => {
                this.dto = {
                    name: r.name,
                    description: r.description ?? '',
                    photo: r.photo ?? '',
                    status: r.status
                };
            },
            error: e => this.error = this.extractErrorMessage(e)
        });
    }

    onFileChange(ev: Event): void {
        const input = ev.target as HTMLInputElement;
        this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;

        // Generate preview
        if (this.selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(this.selectedFile);
        } else {
            this.imagePreview = null;
        }
    }

    formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    save(): void {
        this.error = '';

        const dtoToSend: RecipeCreateUpdate = {
            name: this.dto.name,
            description: this.dto.description,
            status: this.dto.status,
            photo: this.photoMode === 'url' ? (this.dto.photo ?? '') : ''
        };

        if (this.id === null) {
            this.recipesSvc.create(dtoToSend).subscribe({
                next: created => this.afterSave(created.id),
                error: e => this.error = this.extractErrorMessage(e)
            });
        } else {
            this.recipesSvc.update(this.id, dtoToSend).subscribe({
                next: updated => this.afterSave(updated.id),
                error: e => this.error = this.extractErrorMessage(e)
            });
        }
    }

    private afterSave(id: number): void {
        if (this.photoMode === 'upload' && this.selectedFile) {
            this.recipesSvc.uploadPhoto(id, this.selectedFile).subscribe({
                next: () => this.router.navigateByUrl('/recipes'),
                error: e => this.error = this.extractErrorMessage(e)
            });
            return;
        }

        this.router.navigateByUrl('/recipes');
    }

    private extractErrorMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error?.error?.message) return error.error.message;
        if (error?.error?.title) return error.error.title;
        if (typeof error?.error === 'string') return error.error;
        if (error?.message) return error.message;
        return 'An error occurred';
    }
}