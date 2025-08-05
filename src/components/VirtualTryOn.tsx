import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutfitCatalog } from './OutfitCatalog';
import { TryOnResult } from './TryOnResult';
import { ImageUpload } from './virtual-tryon/ImageUpload';
import { GenderSelection } from './virtual-tryon/GenderSelection';
import { ProcessingStatus } from './virtual-tryon/ProcessingStatus';
import { ApiKeyInput } from './virtual-tryon/ApiKeyInput';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useTryOnApi } from '@/hooks/useTryOnApi';
import { Outfit, TryOnStep } from '@/types/tryOn';

// API key will be handled via Supabase secrets
// For now, users can input their key in the UI

export const VirtualTryOn = () => {
  const [currentStep, setCurrentStep] = useState<TryOnStep>('upload');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('replicate_api_key'));

  // Custom hooks for modular functionality
  const {
    uploadedImage,
    imagePreview,
    isValidImage,
    handleFileChange,
    clearImage,
  } = useImageUpload();

  const {
    isProcessing,
    progress,
    predictionId,
    submitTryOn,
    reset: resetApi,
  } = useTryOnApi();

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setCurrentStep('outfits');
  };

  const handleOutfitSelect = async (outfit: Outfit) => {
    if (!uploadedImage || !selectedGender || !apiKey) return;

    setSelectedOutfit(outfit);
    setCurrentStep('processing');

    const result = await submitTryOn(
      {
        personImage: uploadedImage,
        clothingImageUrl: outfit.image,
        gender: selectedGender,
      },
      apiKey
    );

    if (result) {
      setResultImage(result);
      setCurrentStep('result');
    } else {
      // Error already shown by hook
      setCurrentStep('outfits');
    }
  };

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
  };

  const resetTryOn = () => {
    setCurrentStep('upload');
    clearImage();
    setSelectedGender(null);
    setSelectedOutfit(null);
    setResultImage(null);
    resetApi();
  };

  const goBack = () => {
    switch (currentStep) {
      case 'gender':
        setCurrentStep('upload');
        break;
      case 'outfits':
        setCurrentStep('gender');
        break;
      case 'processing':
        setCurrentStep('outfits');
        break;
      case 'result':
        setCurrentStep('outfits');
        break;
    }
  };

  const handleImageUploadSuccess = () => {
    setCurrentStep('gender');
  };

  // Move to gender selection when image is uploaded
  if (currentStep === 'upload' && isValidImage) {
    handleImageUploadSuccess();
  }

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
                  currentStep === step || (currentStep === 'processing' && step === 'outfits')
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={cn(
                    "w-16 h-1 mx-2 rounded transition-colors",
                    (['upload', 'gender', 'outfits'].indexOf(currentStep) > index ||
                     (currentStep === 'processing' && index < 2))
                      ? "bg-primary" 
                      : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          {currentStep !== 'upload' && currentStep !== 'processing' ? (
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep !== 'upload' && currentStep !== 'processing' && (
            <Button variant="outline" onClick={resetTryOn}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>

        {/* Step Content */}
        {!apiKey ? (
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
        ) : (
          <>
            {currentStep === 'upload' && (
              <ImageUpload
                imagePreview={imagePreview}
                isValidImage={isValidImage}
                onFileChange={handleFileChange}
                onClearImage={clearImage}
              />
            )}

            {currentStep === 'gender' && (
              <GenderSelection onGenderSelect={handleGenderSelect} />
            )}

            {currentStep === 'outfits' && selectedGender && (
              <OutfitCatalog
                gender={selectedGender}
                onOutfitSelect={handleOutfitSelect}
                isProcessing={false}
              />
            )}

            {currentStep === 'processing' && (
              <ProcessingStatus
                progress={progress}
                predictionId={predictionId}
              />
            )}

            {currentStep === 'result' && resultImage && selectedOutfit && imagePreview && (
              <TryOnResult
                originalImage={imagePreview}
                resultImage={resultImage}
                outfit={selectedOutfit}
                onTryAnother={() => setCurrentStep('outfits')}
                onStartOver={resetTryOn}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};