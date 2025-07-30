import { Button } from "@/components/ui/button";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Style Sphere
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#try-on" className="text-foreground hover:text-primary transition-colors">
              Try On
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Browse
            </a>
            <a href="#wardrobe" className="text-foreground hover:text-primary transition-colors">
              Wardrobe
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors">
              Social
            </a>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search fashion items..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <Button 
              variant="hero" 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Try Now
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#try-on" className="text-foreground hover:text-primary transition-colors">
                Try On
              </a>
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                Browse
              </a>
              <a href="#wardrobe" className="text-foreground hover:text-primary transition-colors">
                Wardrobe
              </a>
              <a href="#community" className="text-foreground hover:text-primary transition-colors">
                Social
              </a>
              <div className="pt-2">
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="w-full"
                  onClick={() => document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Try Now
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};