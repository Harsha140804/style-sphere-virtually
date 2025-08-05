import { TryOnRequest } from '@/types/tryOn';
import { removeBackground, loadImage } from '@/lib/background-removal';

export class BasicTryOnService {
  async submitTryOn(request: TryOnRequest): Promise<string> {
    try {
      console.log('Starting basic try-on compositing...');
      
      // Load the person image
      const personImage = await loadImage(request.personImage);
      
      // Load the clothing image
      const clothingImage = await this.loadImageFromUrl(request.clothingImageUrl);
      
      // Remove background from person image
      const personNoBackground = await removeBackground(personImage);
      const personElement = await loadImage(personNoBackground);
      
      // Composite the images
      const resultBlob = await this.compositeImages(personElement, clothingImage, request.gender);
      
      // Convert to URL for display
      const resultUrl = URL.createObjectURL(resultBlob);
      console.log('Basic try-on compositing completed');
      
      return resultUrl;
    } catch (error) {
      console.error('Basic try-on compositing failed:', error);
      throw error;
    }
  }

  private async loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private async compositeImages(
    personImage: HTMLImageElement, 
    clothingImage: HTMLImageElement, 
    gender: 'male' | 'female'
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Set canvas size based on person image
    canvas.width = personImage.naturalWidth;
    canvas.height = personImage.naturalHeight;
    
    // Draw person image as base
    ctx.drawImage(personImage, 0, 0);
    
    // Calculate clothing position and size based on gender and body estimation
    const clothingRect = this.calculateClothingPosition(
      canvas.width, 
      canvas.height, 
      gender
    );
    
    // Apply clothing with blending
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.8;
    
    ctx.drawImage(
      clothingImage,
      clothingRect.x,
      clothingRect.y,
      clothingRect.width,
      clothingRect.height
    );
    
    // Add highlights for realism
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.3;
    
    ctx.drawImage(
      clothingImage,
      clothingRect.x,
      clothingRect.y,
      clothingRect.width,
      clothingRect.height
    );
    
    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    
    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create composite image'));
          }
        },
        'image/png',
        1.0
      );
    });
  }

  private calculateClothingPosition(
    canvasWidth: number, 
    canvasHeight: number, 
    gender: 'male' | 'female'
  ) {
    // Basic positioning heuristics based on typical body proportions
    const torsoStartY = canvasHeight * 0.25; // Approximately chest level
    const torsoHeight = canvasHeight * 0.5;  // Torso region
    const torsoWidth = canvasWidth * 0.6;    // Body width estimation
    const centerX = canvasWidth * 0.5;
    
    // Adjust for gender differences
    const widthMultiplier = gender === 'female' ? 0.55 : 0.65;
    const heightMultiplier = gender === 'female' ? 0.45 : 0.5;
    
    return {
      x: centerX - (torsoWidth * widthMultiplier) / 2,
      y: torsoStartY,
      width: torsoWidth * widthMultiplier,
      height: torsoHeight * heightMultiplier
    };
  }
}