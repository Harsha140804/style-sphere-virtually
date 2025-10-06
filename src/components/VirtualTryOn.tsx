import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Sparkles, Download, ArrowLeft, Video, VideoOff } from 'lucide-react';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const startCamera = useCallback(async () => {
    try {
      setIsProcessing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        await videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      
      toast({
        title: "Camera activated",
        description: "Position yourself in the frame and capture your photo"
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use virtual try-on",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      toast({
        title: "Camera not ready",
        description: "Please wait for camera to initialize",
        variant: "destructive"
      });
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setUploadedImage(imageUrl);
        stopCamera();
        setCurrentStep('gender');
        toast({
          title: "Photo captured!",
          description: "Please select your gender to continue"
        });
      }
    }, 'image/jpeg', 0.95);
  }, [stopCamera, toast]);

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
      
      // Draw white background
      outputCtx.fillStyle = '#ffffff';
      outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      
      // Calculate outfit positioning based on person detection
      const outfitScale = Math.min(
        outputCanvas.width * 0.4 / outfitImage.width,
        outputCanvas.height * 0.6 / outfitImage.height
      );
      
      const outfitWidth = outfitImage.width * outfitScale;
      const outfitHeight = outfitImage.height * outfitScale;
      
      // Position outfit on torso area (approximately)
      const outfitX = (outputCanvas.width - outfitWidth) / 2;
      const outfitY = outputCanvas.height * 0.2; // Upper body area
      
      // Create a temporary canvas for outfit with person-shaped mask
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Could not get temp canvas context');
      
      tempCanvas.width = outputCanvas.width;
      tempCanvas.height = outputCanvas.height;
      
      // Draw scaled outfit
      tempCtx.drawImage(outfitImage, outfitX, outfitY, outfitWidth, outfitHeight);
      
      // Apply person mask to the outfit
      const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const tempData = tempImageData.data;
      
      // Use person mask to show outfit only where person is
      for (let i = 0; i < personMask.data.length; i++) {
        const alpha = personMask.data[i];
        const pixelIndex = i * 4;
        // Make outfit visible only where person is detected
        tempData[pixelIndex + 3] = Math.min(tempData[pixelIndex + 3], alpha);
      }
      
      tempCtx.putImageData(tempImageData, 0, 0);
      
      // Now composite everything
      // First draw the background (original image with person removed for clothing area)
      outputCtx.drawImage(userImage, 0, 0);
      
      // Create mask for clothing area and blend the outfit
      const userImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const userData = userImageData.data;
      
      // Get the processed outfit data
      const finalOutfitData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const outfitData = finalOutfitData.data;
      
      // Blend outfit with user image in clothing areas
      for (let i = 0; i < userData.length; i += 4) {
        const pixelIndex = i / 4;
        const personAlpha = personMask.data[pixelIndex];
        const outfitAlpha = outfitData[i + 3] / 255;
        
        // If we have both person and outfit in this pixel, blend them
        if (personAlpha > 50 && outfitAlpha > 0.1) {
          // Blend the colors based on outfit strength
          const blendFactor = 0.7; // How much outfit to show
          userData[i] = Math.round(userData[i] * (1 - blendFactor) + outfitData[i] * blendFactor);     // R
          userData[i + 1] = Math.round(userData[i + 1] * (1 - blendFactor) + outfitData[i + 1] * blendFactor); // G
          userData[i + 2] = Math.round(userData[i + 2] * (1 - blendFactor) + outfitData[i + 2] * blendFactor); // B
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
    if (isCameraActive) {
      stopCamera();
    }
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
    if (isCameraActive) {
      stopCamera();
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
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Upload Your Photo</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Upload a clear, full-body photo of yourself to get started with virtual try-on
              </p>

              {/* Camera Section */}
              {isCameraActive && (
                <div className="space-y-4">
                  <div className="relative max-w-md mx-auto">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-lg border-2 border-primary"
                    />
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={capturePhoto} variant="hero" size="lg">
                      <Camera className="w-5 h-5 mr-2" />
                      Capture Photo
                    </Button>
                    <Button onClick={stopCamera} variant="outline" size="lg">
                      <VideoOff className="w-5 h-5 mr-2" />
                      Stop Camera
                    </Button>
                  </div>
                </div>
              )}

              {isCameraActive && <div className="text-sm text-muted-foreground">
                Position yourself in the frame and click "Capture Photo" when ready
              </div>}

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