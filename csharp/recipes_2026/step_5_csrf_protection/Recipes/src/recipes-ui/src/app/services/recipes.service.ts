import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum RecipeStatus {
    Draft = 0,
    Published = 1
}

export interface Recipe {
    id: number;
    name: string;
    description?: string;
    photo?: string;   // URL or /uploads/... path
    status: RecipeStatus;
}

export interface RecipeCreateUpdate {
    name: string;
    description?: string;
    photo?: string;   // used when mode=url
    status: RecipeStatus;
}

@Injectable({ providedIn: 'root' })
export class RecipesService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Recipe[]> {
        return this.http.get<Recipe[]>('/bff/recipes', { withCredentials: true });
    }

    getById(id: number): Observable<Recipe> {
        return this.http.get<Recipe>(`/bff/recipes/${id}`, { withCredentials: true });
    }

    create(dto: RecipeCreateUpdate): Observable<Recipe> {
        return this.http.post<Recipe>('/bff/recipes', dto, { withCredentials: true });
    }

    update(id: number, dto: RecipeCreateUpdate): Observable<Recipe> {
        return this.http.put<Recipe>(`/bff/recipes/${id}`, dto, { withCredentials: true });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`/bff/recipes/${id}`, { withCredentials: true });
    }

    uploadPhoto(id: number, file: File): Observable<Recipe> {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<Recipe>(`/bff/recipes/${id}/photo`, fd, { withCredentials: true });

    }
}
