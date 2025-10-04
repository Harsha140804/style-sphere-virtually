import { Button } from "@/components/ui/button";
import { ArrowRight, Users, ShoppingCart, Camera, Sparkles, Ruler, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import tryOnImage from "@/assets/tryon-feature.jpg";
import wardrobeImage from "@/assets/wardrobe-feature.jpg";

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-fashion-neutral/20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Revolutionary
            </span>{" "}
            Fashion Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the future of online shopping with AI-powered virtual try-ons and intelligent fashion recommendations.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Virtual Try-On Feature */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-gradient-primary/10 rounded-full px-4 py-2 mb-4 w-fit">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Virtual Try-On</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              See Yourself in <span className="text-primary">Any Outfit</span>
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Upload your photo or use live camera to instantly try on thousands of clothing items. 
              Our AI technology maps clothes perfectly to your body shape and posture.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time virtual fitting with live camera</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>360° view with adjustable angles</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Layer multiple items for complete outfits</span>
              </li>
            </ul>
            <Link to="/browse">
              <Button variant="fashion" size="lg" className="w-fit">
                Try Virtual Fitting <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={tryOnImage} 
                alt="Virtual Try-On Interface" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Smart Wardrobe Feature */}
          <div className="order-3">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src={wardrobeImage} 
                alt="Smart Wardrobe Management" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          <div className="flex flex-col justify-center order-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-secondary/10 rounded-full px-4 py-2 mb-4 w-fit">
              <ShoppingCart className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Smart Wardrobe</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Organize Your <span className="text-secondary">Digital Closet</span>
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Build and manage your virtual wardrobe with intelligent categorization, 
              outfit planning, and personalized style recommendations.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>AI-powered outfit suggestions</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Track usage and discover neglected items</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Plan outfits for special occasions</span>
              </li>
            </ul>
            <Link to="/wardrobe">
              <Button variant="teal" size="lg" className="w-fit">
                Explore Wardrobe <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-soft transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Smart Sizing</h4>
            <p className="text-muted-foreground text-sm">
              AI analyzes your measurements for perfect size recommendations across all brands.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-soft transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Multi-Platform</h4>
            <p className="text-muted-foreground text-sm">
              Shop from Myntra, Amazon, Flipkart and compare prices across platforms.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-soft transition-all duration-300">
            <div className="w-12 h-12 bg-fashion-rose rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Style AI</h4>
            <p className="text-muted-foreground text-sm">
              Get personalized style recommendations based on your preferences and body type.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-soft transition-all duration-300">
            <div className="w-12 h-12 bg-fashion-teal rounded-xl flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-lg mb-2">Social Sharing</h4>
            <p className="text-muted-foreground text-sm">
              Share your looks, get feedback, and discover trending styles from the community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};