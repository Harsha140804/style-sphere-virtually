import { TryOnApiResponse, TryOnRequest } from '@/types/tryOn';

const REPLICATE_API_URL = 'https://api.replicate.com/v1';
const MODEL = 'cuuupid/idm-vton';

export class TryOnApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async submitTryOn(request: TryOnRequest): Promise<string> {
    try {
      // Convert file to base64 data URL
      const personImageDataUrl = await this.fileToDataUrl(request.personImage);
      
      const response = await fetch(`${REPLICATE_API_URL}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2a4819e81f84937', // IDM-VTON version
          input: {
            model_image: personImageDataUrl,
            cloth_image: request.clothingImageUrl,
            mask_only: false,
            auto_mask: true,
            auto_crop: true,
            seed: Math.floor(Math.random() * 1000000),
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error submitting try-on request:', error);
      throw error;
    }
  }

  async getTryOnStatus(predictionId: string): Promise<TryOnApiResponse> {
    try {
      const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking try-on status:', error);
      throw error;
    }
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async pollForResult(predictionId: string, maxAttempts: number = 60): Promise<TryOnApiResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getTryOnStatus(predictionId);
      
      if (status.status === 'succeeded' || status.status === 'failed') {
        return status;
      }
      
      // Wait 3 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    throw new Error('Try-on processing timed out');
  }
}