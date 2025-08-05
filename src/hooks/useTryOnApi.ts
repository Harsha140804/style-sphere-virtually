import { useState } from 'react';
import { BasicTryOnService } from '@/services/basicTryOnService';
import { TryOnRequest } from '@/types/tryOn';
import { useToast } from '@/hooks/use-toast';

export const useTryOnApi = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const submitTryOn = async (request: TryOnRequest): Promise<string | null> => {
    try {
      setIsProcessing(true);
      setProgress(25);
      
      toast({
        title: "Processing Try-On",
        description: "Compositing your virtual try-on...",
      });

      const basicService = new BasicTryOnService();
      setProgress(50);
      
      const result = await basicService.submitTryOn(request);
      
      setProgress(100);
      toast({
        title: "Try-On Complete",
        description: "Your virtual try-on is ready!",
      });
      
      return result;
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
    }
  };


  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
  };

  return {
    isProcessing,
    progress,
    submitTryOn,
    reset,
  };
};