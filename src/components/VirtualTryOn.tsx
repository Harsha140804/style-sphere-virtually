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
        description: "AI is generating your realistic virtual try-on"
      });
      
      // Load the uploaded image
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const userImage = await loadImage(blob);
      
      const { pipeline } = await import('@huggingface/transformers');
      
      // Step 1: Get detailed segmentation for clothing removal
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
      
      // Get comprehensive segmentation
      const segmentationResult = await segmenter(imageData);
      
      // Find relevant body part masks
      const personMask = segmentationResult.find((segment: any) => segment.label === 'person')?.mask;
      const clothingMask = segmentationResult.find((segment: any) => 
        segment.label.includes('clothing') || segment.label.includes('shirt') || 
        segment.label.includes('dress') || segment.label.includes('top')
      )?.mask;
      
      if (!personMask) {
        throw new Error('Could not detect person in image');
      }
      
      // Step 2: Pose estimation for body keypoints
      const poseDetector = await pipeline('object-detection', 'Xenova/yolos-tiny', {
        device: 'webgpu',
      });
      
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
      
      // Step 3: Analyze person bounds and body structure
      let minX = userImage.width, maxX = 0, minY = userImage.height, maxY = 0;
      let shoulderY = userImage.height, waistY = 0, hipY = 0;
      
      for (let y = 0; y < userImage.height; y++) {
        let hasPersonPixel = false;
        for (let x = 0; x < userImage.width; x++) {
          const idx = y * userImage.width + x;
          if (personMask.data[idx] > 128) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            hasPersonPixel = true;
          }
        }
        
        // Estimate body landmarks
        if (hasPersonPixel) {
          const personHeightSoFar = y - minY;
          const totalPersonHeight = maxY - minY;
          
          if (personHeightSoFar < totalPersonHeight * 0.25) {
            shoulderY = Math.max(shoulderY, y);
          } else if (personHeightSoFar < totalPersonHeight * 0.55) {
            waistY = Math.max(waistY, y);
          } else if (personHeightSoFar < totalPersonHeight * 0.75) {
            hipY = Math.max(hipY, y);
          }
        }
      }
      
      const personWidth = maxX - minX;
      const personHeight = maxY - minY;
      const personCenterX = (minX + maxX) / 2;
      
      // Step 4: Create body-aware clothing mask
      const bodyMask = new Uint8ClampedArray(userImage.width * userImage.height);
      
      for (let y = 0; y < userImage.height; y++) {
        for (let x = 0; x < userImage.width; x++) {
          const idx = y * userImage.width + x;
          const personValue = personMask.data[idx];
          
          // Create clothing-specific mask based on outfit type
          if (personValue > 128) {
            if (outfit.category === 'dress') {
              // Dress covers from shoulders to knees/ankles
              if (y >= shoulderY && y <= Math.min(hipY + personHeight * 0.4, maxY)) {
                // Calculate body width at this height for natural tapering
                const bodyProgress = (y - shoulderY) / (hipY - shoulderY);
                const widthFactor = 0.6 + 0.4 * Math.sin(bodyProgress * Math.PI);
                const targetWidth = personWidth * widthFactor;
                const centerDistance = Math.abs(x - personCenterX);
                
                if (centerDistance < targetWidth / 2) {
                  bodyMask[idx] = 255;
                }
              }
            } else if (outfit.category === 'top') {
              // Top covers shoulders to waist
              if (y >= shoulderY && y <= waistY) {
                const bodyProgress = (y - shoulderY) / (waistY - shoulderY);
                const widthFactor = 0.7 + 0.3 * Math.sin(bodyProgress * Math.PI * 0.5);
                const targetWidth = personWidth * widthFactor;
                const centerDistance = Math.abs(x - personCenterX);
                
                if (centerDistance < targetWidth / 2) {
                  bodyMask[idx] = 255;
                }
              }
            }
          }
        }
      }
      
      // Step 5: Remove existing clothing in target area
      const baseImageData = inputCtx.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
      const baseData = baseImageData.data;
      
      for (let i = 0; i < bodyMask.length; i++) {
        if (bodyMask[i] > 0 && clothingMask && clothingMask.data[i] > 100) {
          const pixelIdx = i * 4;
          // Inpaint clothing area with skin-like color estimation
          const surroundingPixels = [];
          const radius = 5;
          const centerX = i % userImage.width;
          const centerY = Math.floor(i / userImage.width);
          
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = centerX + dx;
              const ny = centerY + dy;
              const ni = ny * userImage.width + nx;
              
              if (nx >= 0 && nx < userImage.width && ny >= 0 && ny < userImage.height) {
                if (personMask.data[ni] > 128 && (!clothingMask || clothingMask.data[ni] < 50)) {
                  const nPixelIdx = ni * 4;
                  surroundingPixels.push([
                    baseData[nPixelIdx],
                    baseData[nPixelIdx + 1], 
                    baseData[nPixelIdx + 2]
                  ]);
                }
              }
            }
          }
          
          if (surroundingPixels.length > 0) {
            const avgR = surroundingPixels.reduce((sum, p) => sum + p[0], 0) / surroundingPixels.length;
            const avgG = surroundingPixels.reduce((sum, p) => sum + p[1], 0) / surroundingPixels.length;
            const avgB = surroundingPixels.reduce((sum, p) => sum + p[2], 0) / surroundingPixels.length;
            
            baseData[pixelIdx] = avgR;
            baseData[pixelIdx + 1] = avgG;
            baseData[pixelIdx + 2] = avgB;
          }
        }
      }
      
      inputCtx.putImageData(baseImageData, 0, 0);
      outputCtx.drawImage(inputCanvas, 0, 0);
      
      // Step 6: Warp and fit clothing to body
      const outfitCanvas = document.createElement('canvas');
      const outfitCtx = outfitCanvas.getContext('2d');
      if (!outfitCtx) throw new Error('Could not get outfit canvas context');
      
      outfitCanvas.width = userImage.width;
      outfitCanvas.height = userImage.height;
      
      // Apply perspective transformation and body-fitted warping
      for (let y = 0; y < userImage.height; y++) {
        for (let x = 0; x < userImage.width; x++) {
          const idx = y * userImage.width + x;
          
          if (bodyMask[idx] > 0) {
            // Calculate corresponding outfit pixel with body-aware mapping
            let outfitX, outfitY;
            
            if (outfit.category === 'dress') {
              const progress = (y - shoulderY) / (Math.min(hipY + personHeight * 0.4, maxY) - shoulderY);
              const bodyWidthAtY = personWidth * (0.6 + 0.4 * Math.sin(progress * Math.PI));
              const normalizedX = (x - personCenterX) / (bodyWidthAtY / 2);
              
              outfitX = (normalizedX * 0.5 + 0.5) * outfitImage.width;
              outfitY = progress * outfitImage.height;
            } else if (outfit.category === 'top') {
              const progress = (y - shoulderY) / (waistY - shoulderY);
              const bodyWidthAtY = personWidth * (0.7 + 0.3 * Math.sin(progress * Math.PI * 0.5));
              const normalizedX = (x - personCenterX) / (bodyWidthAtY / 2);
              
              outfitX = (normalizedX * 0.5 + 0.5) * outfitImage.width;
              outfitY = progress * outfitImage.height;
            } else {
              outfitX = x;
              outfitY = y;
            }
            
            // Bilinear interpolation for smooth warping
            if (outfitX >= 0 && outfitX < outfitImage.width && outfitY >= 0 && outfitY < outfitImage.height) {
              const x1 = Math.floor(outfitX);
              const y1 = Math.floor(outfitY);
              const x2 = Math.min(x1 + 1, outfitImage.width - 1);
              const y2 = Math.min(y1 + 1, outfitImage.height - 1);
              
              const fx = outfitX - x1;
              const fy = outfitY - y1;
              
              // Sample outfit pixels
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = outfitImage.width;
              tempCanvas.height = outfitImage.height;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                tempCtx.drawImage(outfitImage, 0, 0);
                const outfitImageData = tempCtx.getImageData(0, 0, outfitImage.width, outfitImage.height);
                const outfitData = outfitImageData.data;
                
                const getPixel = (px: number, py: number) => {
                  const pidx = (py * outfitImage.width + px) * 4;
                  return [
                    outfitData[pidx],
                    outfitData[pidx + 1],
                    outfitData[pidx + 2],
                    outfitData[pidx + 3]
                  ];
                };
                
                const p1 = getPixel(x1, y1);
                const p2 = getPixel(x2, y1);
                const p3 = getPixel(x1, y2);
                const p4 = getPixel(x2, y2);
                
                // Bilinear interpolation
                const interpolatedPixel = [
                  p1[0] * (1 - fx) * (1 - fy) + p2[0] * fx * (1 - fy) + p3[0] * (1 - fx) * fy + p4[0] * fx * fy,
                  p1[1] * (1 - fx) * (1 - fy) + p2[1] * fx * (1 - fy) + p3[1] * (1 - fx) * fy + p4[1] * fx * fy,
                  p1[2] * (1 - fx) * (1 - fy) + p2[2] * fx * (1 - fy) + p3[2] * (1 - fx) * fy + p4[2] * fx * fy,
                  p1[3] * (1 - fx) * (1 - fy) + p2[3] * fx * (1 - fy) + p3[3] * (1 - fx) * fy + p4[3] * fx * fy
                ];
                
                if (interpolatedPixel[3] > 50) { // Has significant alpha
                  const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
                  const outputData = outputImageData.data;
                  const outputIdx = idx * 4;
                  
                  // Blend with lighting and shadow awareness
                  const originalBrightness = (outputData[outputIdx] + outputData[outputIdx + 1] + outputData[outputIdx + 2]) / 3;
                  const lightingFactor = Math.max(0.3, originalBrightness / 128); // Preserve shadows
                  
                  outputData[outputIdx] = interpolatedPixel[0] * lightingFactor;
                  outputData[outputIdx + 1] = interpolatedPixel[1] * lightingFactor;
                  outputData[outputIdx + 2] = interpolatedPixel[2] * lightingFactor;
                  
                  outputCtx.putImageData(outputImageData, 0, 0);
                }
              }
            }
          }
        }
      }
      
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