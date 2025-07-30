import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, ShoppingCart, Heart, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Outfit {
  id: string;
  name: string;
  image: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  brand: string;
  price: number;
  platform: string;
}

interface TryOnResultProps {
  originalImage: string;
  resultImage: string;
  outfit: Outfit;
  onTryAnother: () => void;
  onStartOver: () => void;
}

export const TryOnResult = ({ 
  originalImage, 
  resultImage, 
  outfit, 
  onTryAnother, 
  onStartOver 
}: TryOnResultProps) => {
  const [showComparison, setShowComparison] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `style-sphere-tryOn-${outfit.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded successfully",
        description: "Your try-on result has been saved to your device"
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my virtual try-on - ${outfit.name}`,
          text: `I tried on this ${outfit.name} from ${outfit.brand} using Style Sphere!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard"
      });
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from wardrobe" : "Saved to wardrobe",
      description: isSaved 
        ? "This try-on has been removed from your virtual wardrobe" 
        : "This try-on has been saved to your virtual wardrobe"
    });
  };

  const handleBuyNow = () => {
    // In real implementation, this would redirect to the actual product page
    toast({
      title: "Redirecting to store",
      description: `Opening ${outfit.name} on ${outfit.platform}...`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Virtual Try-On Result</h2>
            <p className="text-muted-foreground">
              Here's how you look in the <strong>{outfit.name}</strong> by {outfit.brand}
            </p>
          </div>
          <Badge className="bg-gradient-primary text-white">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Generated
          </Badge>
        </div>
      </Card>

      {/* Main Result */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Try-on Result */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative">
              <img
                src={resultImage}
                alt="Try-on result"
                className="w-full h-auto"
              />
              
              {/* Comparison Toggle */}
              <div className="absolute top-4 left-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  className="bg-white/90 hover:bg-white"
                >
                  {showComparison ? 'Hide Original' : 'Show Original'}
                </Button>
              </div>

              {/* Overlay for comparison */}
              {showComparison && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 max-w-md w-full p-4">
                    <div className="text-center">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-auto rounded-lg"
                      />
                      <p className="text-white text-sm mt-2">Original</p>
                    </div>
                    <div className="text-center">
                      <img
                        src={resultImage}
                        alt="With outfit"
                        className="w-full h-auto rounded-lg"
                      />
                      <p className="text-white text-sm mt-2">With Outfit</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gradient-card border-t">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSave} variant="outline">
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save to Wardrobe'}
                </Button>
                
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Outfit Details & Actions */}
        <div className="space-y-6">
          {/* Outfit Info */}
          <Card className="p-6">
            <div className="flex gap-4 mb-4">
              <img
                src={outfit.image}
                alt={outfit.name}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=80&fit=crop&auto=format`;
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{outfit.name}</h3>
                <p className="text-muted-foreground">{outfit.brand}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{outfit.category}</Badge>
                  <Badge>{outfit.platform}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">₹{outfit.price.toLocaleString()}</span>
                <span className="text-sm text-green-600 font-medium">✓ In Stock</span>
              </div>
              
              <Button onClick={handleBuyNow} className="w-full" size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Now on {outfit.platform}
              </Button>
            </div>
          </Card>

          {/* Size Recommendation */}
          <Card className="p-6">
            <h4 className="font-semibold mb-3">Size Recommendation</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recommended Size:</span>
                <span className="font-medium">M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fit Confidence:</span>
                <span className="font-medium text-green-600">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your measurements, this size should fit perfectly with a regular fit.
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={onTryAnother} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Another Outfit
            </Button>
            
            <Button onClick={onStartOver} variant="ghost" className="w-full">
              Start Over
            </Button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Complete the Look</h4>
        <p className="text-muted-foreground text-sm mb-4">
          Recommended accessories and items that pair well with this outfit
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Casual Sneakers', price: 2999, image: '/api/placeholder/150/150' },
            { name: 'Leather Watch', price: 1499, image: '/api/placeholder/150/150' },
            { name: 'Canvas Bag', price: 899, image: '/api/placeholder/150/150' },
            { name: 'Sunglasses', price: 1299, image: '/api/placeholder/150/150' }
          ].map((item, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop&auto=format`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};