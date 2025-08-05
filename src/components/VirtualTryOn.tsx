import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Sparkles, Download, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { removeBackground, loadImage } from '@/lib/background-removal';
import { OutfitCatalog } from './OutfitCatalog';
import { TryOnResult } from './TryOnResult';

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

type TryOnStep = 'upload' | 'gender' | 'outfits' | 'result';

export const VirtualTryOn = () => {
  const [currentStep, setCurrentStep] = useState<TryOnStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      // Auto-detect or proceed to gender selection
      setCurrentStep('gender');
      
      toast({
        title: "Image uploaded successfully",
        description: "Please select your gender to see relevant outfits"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setCurrentStep('outfits');
  };

  const handleOutfitSelect = async (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setIsProcessing(true);
    
    try {
      if (!uploadedImage) throw new Error('No uploaded image');
      
      toast({
        title: "Processing...",
        description: "AI is generating your virtual try-on"
      });
      
      // Load the uploaded image
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const userImage = await loadImage(blob);
      
      // Get segmentation result to find person mask
      const { pipeline } = await import('@huggingface/transformers');
      const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        device: 'webgpu',
      });
      
      // Convert to canvas and get base64
      const inputCanvas = document.createElement('canvas');
      const inputCtx = inputCanvas.getContext('2d');
      if (!inputCtx) throw new Error('Could not get input canvas context');
      
      inputCanvas.width = userImage.width;
      inputCanvas.height = userImage.height;
      inputCtx.drawImage(userImage, 0, 0);
      const imageData = inputCanvas.toDataURL('image/jpeg', 0.8);
      
      // Get segmentation masks
      const segmentationResult = await segmenter(imageData);
      
      // Find person mask
      const personMask = segmentationResult.find((segment: any) => segment.label === 'person')?.mask;
      if (!personMask) {
        throw new Error('Could not detect person in image');
      }
      
      // Load the outfit image
      const outfitResponse = await fetch(outfit.image);
      const outfitBlob = await outfitResponse.blob();
      const outfitImage = await loadImage(outfitBlob);
      
      // Create the final composite
      const outputCanvas = document.createElement('canvas');
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) throw new Error('Could not get output canvas context');
      
      outputCanvas.width = userImage.width;
      outputCanvas.height = userImage.height;
      
      // Start with the original user image as base
      outputCtx.drawImage(userImage, 0, 0);
      
      // Analyze person bounds for better outfit positioning
      let minX = userImage.width, maxX = 0, minY = userImage.height, maxY = 0;
      for (let y = 0; y < userImage.height; y++) {
        for (let x = 0; x < userImage.width; x++) {
          const idx = y * userImage.width + x;
          if (personMask.data[idx] > 128) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      const personWidth = maxX - minX;
      const personHeight = maxY - minY;
      const personCenterX = (minX + maxX) / 2;
      
      // Calculate better outfit positioning based on detected person bounds
      let outfitScale, outfitX, outfitY, outfitWidth, outfitHeight;
      
      if (outfit.category === 'dress') {
        // For dresses, cover torso to legs
        outfitScale = personWidth * 0.8 / outfitImage.width;
        outfitWidth = outfitImage.width * outfitScale;
        outfitHeight = outfitImage.height * outfitScale;
        outfitX = personCenterX - outfitWidth / 2;
        outfitY = minY + personHeight * 0.15; // Start from chest area
      } else if (outfit.category === 'top') {
        // For tops, cover upper torso
        outfitScale = personWidth * 0.75 / outfitImage.width;
        outfitWidth = outfitImage.width * outfitScale;
        outfitHeight = outfitImage.height * outfitScale;
        outfitX = personCenterX - outfitWidth / 2;
        outfitY = minY + personHeight * 0.2; // Chest area
      } else {
        // Default positioning
        outfitScale = personWidth * 0.7 / outfitImage.width;
        outfitWidth = outfitImage.width * outfitScale;
        outfitHeight = outfitImage.height * outfitScale;
        outfitX = personCenterX - outfitWidth / 2;
        outfitY = minY + personHeight * 0.25;
      }
      
      // Create outfit layer with proper masking
      const outfitCanvas = document.createElement('canvas');
      const outfitCtx = outfitCanvas.getContext('2d');
      if (!outfitCtx) throw new Error('Could not get outfit canvas context');
      
      outfitCanvas.width = userImage.width;
      outfitCanvas.height = userImage.height;
      
      // Draw the outfit at calculated position
      outfitCtx.drawImage(outfitImage, outfitX, outfitY, outfitWidth, outfitHeight);
      
      // Apply sophisticated blending
      const outfitImageData = outfitCtx.getImageData(0, 0, outfitCanvas.width, outfitCanvas.height);
      const outfitData = outfitImageData.data;
      const userImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const userData = userImageData.data;
      
      // Enhanced blending algorithm
      for (let y = 0; y < userImage.height; y++) {
        for (let x = 0; x < userImage.width; x++) {
          const idx = y * userImage.width + x;
          const pixelIdx = idx * 4;
          
          const personMaskValue = personMask.data[idx];
          const outfitAlpha = outfitData[pixelIdx + 3];
          
          // Only blend where person is detected and outfit has content
          if (personMaskValue > 100 && outfitAlpha > 50) {
            // Calculate distance from outfit center for natural falloff
            const centerX = outfitX + outfitWidth / 2;
            const centerY = outfitY + outfitHeight / 2;
            const distanceFromCenter = Math.sqrt(
              Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );
            const maxDistance = Math.max(outfitWidth, outfitHeight) / 2;
            const falloff = Math.max(0, 1 - (distanceFromCenter / maxDistance));
            
            // Adaptive blending based on outfit type and position
            let blendStrength = 0.85;
            if (outfit.category === 'dress') {
              // Stronger blending for dresses
              blendStrength = 0.9;
            } else if (outfit.category === 'top') {
              // Medium blending for tops
              blendStrength = 0.8;
            }
            
            // Apply falloff and person mask strength
            const finalBlend = blendStrength * falloff * (personMaskValue / 255);
            
            // Smooth color blending with lighting preservation
            const userBrightness = (userData[pixelIdx] + userData[pixelIdx + 1] + userData[pixelIdx + 2]) / 3;
            const outfitBrightness = (outfitData[pixelIdx] + outfitData[pixelIdx + 1] + outfitData[pixelIdx + 2]) / 3;
            const lightingFactor = userBrightness / Math.max(outfitBrightness, 1);
            
            // Blend colors with lighting preservation
            userData[pixelIdx] = Math.round(
              userData[pixelIdx] * (1 - finalBlend) + 
              (outfitData[pixelIdx] * lightingFactor) * finalBlend
            );
            userData[pixelIdx + 1] = Math.round(
              userData[pixelIdx + 1] * (1 - finalBlend) + 
              (outfitData[pixelIdx + 1] * lightingFactor) * finalBlend
            );
            userData[pixelIdx + 2] = Math.round(
              userData[pixelIdx + 2] * (1 - finalBlend) + 
              (outfitData[pixelIdx + 2] * lightingFactor) * finalBlend
            );
          }
        }
      }
      
      outputCtx.putImageData(userImageData, 0, 0);
      
      // Convert canvas to blob and create URL
      const resultBlob = await new Promise<Blob>((resolve, reject) => {
        outputCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create result blob'));
        }, 'image/png', 1.0);
      });
      
      const resultUrl = URL.createObjectURL(resultBlob);
      setResultImage(resultUrl);
      setCurrentStep('result');
      
      toast({
        title: "Try-on complete!",
        description: "Your virtual try-on is ready"
      });
      
    } catch (error) {
      console.error('Error processing try-on:', error);
      toast({
        title: "Try-on failed",
        description: "Failed to generate try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTryOn = () => {
    setCurrentStep('upload');
    setUploadedImage(null);
    setSelectedGender(null);
    setSelectedOutfit(null);
    setResultImage(null);
  };

  const goBack = () => {
    switch (currentStep) {
      case 'gender':
        setCurrentStep('upload');
        break;
      case 'outfits':
        setCurrentStep('gender');
        break;
      case 'result':
        setCurrentStep('outfits');
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Virtual Try-On</h1>
          <p className="text-muted-foreground">Upload your photo and try on outfits with AI</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {(['upload', 'gender', 'outfits', 'result'] as const).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep === step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={cn(
                    "w-16 h-1 mx-2 rounded transition-colors",
                    (['upload', 'gender', 'outfits'].indexOf(currentStep) > index)
                      ? "bg-primary" 
                      : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        {currentStep !== 'upload' && (
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {/* Step Content */}
        {currentStep === 'upload' && (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Upload Your Photo</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Upload a clear, full-body photo of yourself to get started with virtual try-on
              </p>

              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="min-w-[200px]"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Choose Photo'}
                </Button>

                <div className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 'gender' && uploadedImage && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Photo</h3>
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full h-auto rounded-lg"
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select Gender</h3>
              <p className="text-muted-foreground mb-6">
                Choose your gender to see relevant outfit options
              </p>
              
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleGenderSelect('female')}
                  className="w-full justify-start h-16"
                >
                  <div className="text-left">
                    <div className="font-medium">Female</div>
                    <div className="text-sm text-muted-foreground">Dresses, skirts, tops, and more</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleGenderSelect('male')}
                  className="w-full justify-start h-16"
                >
                  <div className="text-left">
                    <div className="font-medium">Male</div>
                    <div className="text-sm text-muted-foreground">Shirts, pants, suits, and more</div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 'outfits' && selectedGender && (
          <OutfitCatalog
            gender={selectedGender}
            onOutfitSelect={handleOutfitSelect}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'result' && resultImage && selectedOutfit && (
          <TryOnResult
            originalImage={uploadedImage!}
            resultImage={resultImage}
            outfit={selectedOutfit}
            onTryAnother={() => setCurrentStep('outfits')}
            onStartOver={resetTryOn}
          />
        )}
      </div>
    </div>
  );
};