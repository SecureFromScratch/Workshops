export interface IRecipe{
    id:number;
    name: string;
    instructions:string;
    imagePath?:string;
    image?: string; // Base64 image data
    base64Image?: string; // Base64 image data

    }