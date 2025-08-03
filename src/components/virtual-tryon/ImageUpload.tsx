import { Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  imagePreview: string | null;
  isValidImage: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

export const ImageUpload = ({ 
  imagePreview, 
  isValidImage, 
  onFileChange, 
  onClearImage 
}: ImageUploadProps) => {
  return (
    <div className="max-w-md mx-auto">
      {!imagePreview ? (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <label htmlFor="image-upload" className="cursor-pointer block p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Photo</h3>
              <p className="text-muted-foreground mb-4">
                Choose a clear, well-lit photo of yourself for the best results
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Camera className="w-4 h-4" />
                <span>JPG, PNG, or WebP • Max 10MB</span>
              </div>
            </div>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </Card>
      ) : (
        <div className="relative">
          <Card className="overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Uploaded preview" 
              className="w-full h-80 object-cover"
            />
          </Card>
          <Button
            onClick={onClearImage}
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {isValidImage && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300 text-center">
            ✓ Photo uploaded successfully. Choose your gender to continue.
          </p>
        </div>
      )}
    </div>
  );
};