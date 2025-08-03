import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isValidImage, setIsValidImage] = useState(false);
  const { toast } = useToast();

  const validateImage = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, WebP).",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleImageUpload = (file: File) => {
    if (!validateImage(file)) {
      return;
    }

    setUploadedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setIsValidImage(true);
      
      toast({
        title: "Image Uploaded",
        description: "Your photo has been uploaded successfully.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setIsValidImage(false);
  };

  return {
    uploadedImage,
    imagePreview,
    isValidImage,
    handleImageUpload,
    handleFileChange,
    clearImage,
  };
};