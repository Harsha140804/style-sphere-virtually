import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Video, VideoOff, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TryOnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemImage: string;
}

export const TryOnDialog: React.FC<TryOnDialogProps> = ({ 
  isOpen, 
  onClose, 
  itemName, 
  itemImage 
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    toast({
      title: "Image uploaded successfully",
      description: "Ready to process virtual try-on!"
    });
  };

  const startCamera = async () => {
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
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
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
        toast({
          title: "Photo captured",
          description: "Ready to process virtual try-on!"
        });
      }
    }, 'image/jpeg', 0.8);
  };

  const processTryOn = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    
    try {
      toast({
        title: "Processing...",
        description: "AI is generating your virtual try-on"
      });
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Try-on complete!",
        description: `You look great in ${itemName}!`
      });
      
      // Here you would integrate with actual try-on functionality
      // For now, we'll just show success message
      
    } catch (error) {
      toast({
        title: "Try-on failed",
        description: "Failed to generate try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const resetDialog = () => {
    setUploadedImage(null);
    setIsCameraActive(false);
    setIsProcessing(false);
    stopCamera();
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Try On: {itemName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Item Preview */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <img 
              src={itemImage} 
              alt={itemName}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium">{itemName}</h3>
              <p className="text-sm text-muted-foreground">Ready to try on</p>
            </div>
          </div>

          {/* Upload Section */}
          {!uploadedImage && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Your Photo</h3>
              
              {/* Camera Section */}
              {isCameraActive && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-lg border-2 border-primary"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={capturePhoto} size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button onClick={stopCamera} variant="outline" size="sm">
                      <VideoOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>

                {!isCameraActive && (
                  <Button
                    onClick={startCamera}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Use Camera
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Preview and Process */}
          {uploadedImage && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Photo</h3>
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-auto rounded-lg max-h-64 object-cover"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={processTryOn}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Generate Try-On'}
                </Button>
                <Button 
                  onClick={resetDialog}
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};