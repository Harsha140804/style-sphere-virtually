export interface Outfit {
  id: string;
  name: string;
  image: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  brand: string;
  price: number;
  platform: string;
}

export interface TryOnRequest {
  personImage: File;
  clothingImageUrl: string;
  gender: 'male' | 'female';
}

export interface TryOnResult {
  id: string;
  resultImageUrl: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processingTime?: number;
}

export type TryOnStep = 'upload' | 'gender' | 'outfits' | 'processing' | 'result';

export interface TryOnApiResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string;
  error?: string;
  logs?: string;
}