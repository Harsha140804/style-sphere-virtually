import { useState } from 'react';
import { TryOnApiService } from '@/services/tryOnApi';
import { TryOnRequest, TryOnApiResponse } from '@/types/tryOn';
import { useToast } from '@/hooks/use-toast';

export const useTryOnApi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const { toast } = useToast();

  const submitTryOn = async (request: TryOnRequest, apiKey: string): Promise<string | null> => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your Replicate API key in the settings.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      
      const apiService = new TryOnApiService(apiKey);
      const id = await apiService.submitTryOn(request);
      
      setPredictionId(id);
      setProgress(20);
      
      toast({
        title: "Try-On Submitted",
        description: "Processing your virtual try-on. This may take up to 2 minutes.",
      });

      // Start polling for results
      const result = await pollForResult(apiService, id);
      
      if (result.status === 'succeeded' && result.output) {
        setProgress(100);
        toast({
          title: "Try-On Complete",
          description: "Your virtual try-on is ready!",
        });
        return result.output;
      } else {
        throw new Error(result.error || 'Try-on processing failed');
      }
    } catch (error) {
      console.error('Try-on failed:', error);
      toast({
        title: "Try-On Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setPredictionId(null);
    }
  };

  const pollForResult = async (apiService: TryOnApiService, id: string): Promise<TryOnApiResponse> => {
    const maxAttempts = 40; // 2 minutes with 3s intervals
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await apiService.getTryOnStatus(id);
      
      // Update progress based on attempt
      const progressValue = 20 + (attempt / maxAttempts) * 70; // 20% to 90%
      setProgress(Math.min(progressValue, 90));
      
      if (status.status === 'succeeded' || status.status === 'failed') {
        return status;
      }
      
      // Wait 3 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    throw new Error('Try-on processing timed out');
  };

  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
    setPredictionId(null);
  };

  return {
    isProcessing,
    progress,
    predictionId,
    submitTryOn,
    reset,
  };
};