import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService, RecipeCreateUpdate, RecipeStatus } from '../../services/recipes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditorComponent } from '@tinymce/tinymce-angular';

type PhotoMode = 'url' | 'upload' | 'fetch';

@Component({
    selector: 'app-recipe',
    standalone: true,
    imports: [CommonModule, FormsModule, EditorComponent],
    templateUrl: './recipe.component.html'
})
export class RecipeComponent implements OnInit {
    id: number | null = null;

    dto: RecipeCreateUpdate = {
        name: '',
        description: '',
        photo: '',        
        createdBy: ''
    };

    RecipeStatus = RecipeStatus;

    photoMode: PhotoMode = 'fetch';
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    
    
    fetchUrl: string = '';
    fetchFilename: string = '';

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
                    createdBy: r.createdBy
                };
            },
            error: e => this.error = this.extractErrorMessage(e)
        });
    }

    onFileChange(ev: Event): void {
        const input = ev.target as HTMLInputElement;
        this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;

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

        console.log('=== Save Debug ===');
        console.log('Photo mode:', this.photoMode);
        console.log('Fetch URL:', this.fetchUrl);
        console.log('Fetch filename:', this.fetchFilename);

        const dtoToSend: RecipeCreateUpdate = {
            name: this.dto.name,
            description: this.dto.description,            
            photo: this.photoMode === 'url' ? (this.dto.photo ?? '') : '',
            createdBy: this.dto.createdBy
        };

        if (this.id === null) {
            console.log('Creating new recipe...');
            this.recipesSvc.create(dtoToSend).subscribe({
                next: created => {
                    console.log('Recipe created with ID:', created.id);
                    this.afterSave(created.id);
                },
                error: e => this.error = this.extractErrorMessage(e)
            });
        } else {
            console.log('Updating recipe ID:', this.id);
            this.recipesSvc.update(this.id, dtoToSend).subscribe({
                next: updated => {
                    console.log('Recipe updated:', updated.id);
                    this.afterSave(updated.id);
                },
                error: e => this.error = this.extractErrorMessage(e)
            });
        }
    }

    private afterSave(id: number): void {
        console.log('=== After Save Debug ===');
        console.log('Recipe ID:', id);
        console.log('Photo mode:', this.photoMode);
        console.log('Selected file:', this.selectedFile);
        console.log('Fetch URL:', this.fetchUrl);
        console.log('Fetch filename:', this.fetchFilename);

        // Handle file upload mode
        if (this.photoMode === 'upload' && this.selectedFile) {
            console.log('Uploading photo file...');
            this.recipesSvc.uploadPhoto(id, this.selectedFile).subscribe({
                next: () => {
                    console.log('Photo uploaded successfully');
                    this.router.navigateByUrl('/recipes');
                },
                error: e => this.error = this.extractErrorMessage(e)
            });
            return;
        }
        
        if (this.photoMode === 'fetch') {
            console.log('Fetch mode detected!');
            
            if (!this.fetchUrl) {
                console.error('Fetch URL is empty!');
                this.error = 'Please provide a URL to fetch';
                return;
            }

            console.log('Calling fetchPhotoFromUrl with:', {
                id,
                url: this.fetchUrl,
                filename: this.fetchFilename
            });

            this.recipesSvc.fetchPhotoFromUrl(id, this.fetchUrl, this.fetchFilename).subscribe({
                next: (result) => {
                    console.log('Fetch successful!', result);
                    this.router.navigateByUrl('/recipes');
                },
                error: e => {
                    console.error('Fetch failed:', e);
                    this.error = this.extractErrorMessage(e);
                }
            });
            return;
        }

        console.log('No photo upload needed, navigating to recipes list');
        this.router.navigateByUrl('/recipes');
    }

    private extractErrorMessage(error: any): string {
        if (typeof error === 'string') return error;
        if (error?.error?.message) return error.error.message;
        if (error?.error?.title) return error.error.title;
        if (error?.error?.error) return error.error.error;
        if (typeof error?.error === 'string') return error.error;
        if (error?.message) return error.message;
        return 'An error occurred';
    }
}
