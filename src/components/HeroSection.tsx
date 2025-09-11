import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, Zap } from "lucide-react";
import heroImage from "@/assets/hero-fashion.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-card backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-border/50">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Virtual Fashion</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Style Sphere
            </span>
            <br />
            <span className="text-foreground">
              Virtual Wardrobe
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up">
            Try on clothes virtually with AI, discover perfect fits, and build your dream wardrobe from top fashion brands.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up">
            <Button 
              variant="hero" 
              size="hero" 
              className="min-w-[200px]"
              onClick={() => {
                const tryOnSection = document.getElementById('try-on');
                if (tryOnSection) {
                  tryOnSection.scrollIntoView({ behavior: 'smooth' });
                  // Small delay to ensure scroll completes before focusing
                  setTimeout(() => {
                    const tryOnElement = tryOnSection.querySelector('input[type="file"]') as HTMLElement;
                    if (tryOnElement) {
                      tryOnElement.focus();
                    }
                  }, 1000);
                }
              }}
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Virtual Try-On
            </Button>
            <Button 
              variant="elegant" 
              size="lg" 
              className="min-w-[200px]"
              onClick={() => {
                window.location.href = '/wardrobe';
              }}
            >
              <Upload className="w-5 h-5 mr-2" />
              Explore Wardrobe
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-up">
            <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-soft transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Try-On</h3>
              <p className="text-muted-foreground text-sm">
                See how clothes look on you in seconds with AI-powered virtual fitting
              </p>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-soft transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Sizing</h3>
              <p className="text-muted-foreground text-sm">
                Get perfect size recommendations based on your body measurements
              </p>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-soft transition-all duration-300">
              <div className="w-12 h-12 bg-fashion-rose rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Multi-Platform</h3>
              <p className="text-muted-foreground text-sm">
                Shop from Myntra, Amazon, Flipkart and more, all in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-fashion-rose/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-fashion-teal/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-fashion-gold/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};