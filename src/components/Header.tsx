import { Button } from "@/components/ui/button";
import { Search, User, ShoppingBag, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { CartSidebar } from "@/components/CartSidebar";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"...`
      });
      // Here you would implement actual search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTryNowClick = () => {
    if (location.pathname === "/") {
      document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate("/#try-on");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✨</span>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Style Sphere
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-foreground hover:text-primary transition-colors ${
                location.pathname === "/" && location.hash === "#try-on" ? "text-primary" : ""
              }`}
              onClick={() => {
                if (location.pathname === "/") {
                  document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Try On
            </Link>
            <Link 
              to="/browse" 
              className={`text-foreground hover:text-primary transition-colors ${
                location.pathname === "/browse" ? "text-primary" : ""
              }`}
            >
              Browse
            </Link>
            <Link 
              to="/wardrobe" 
              className={`text-foreground hover:text-primary transition-colors ${
                location.pathname === "/wardrobe" ? "text-primary" : ""
              }`}
            >
              Wardrobe
            </Link>
            <Link 
              to="/social" 
              className={`text-foreground hover:text-primary transition-colors ${
                location.pathname === "/social" ? "text-primary" : ""
              }`}
            >
              Social
            </Link>
            <Link 
              to="/wishlist" 
              className={`text-foreground hover:text-primary transition-colors ${
                location.pathname === "/wishlist" ? "text-primary" : ""
              }`}
            >
              Wishlist
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search fashion items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </form>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <CartSidebar>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </CartSidebar>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            )}
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
              onClick={handleTryNowClick}
            >
              Try Now
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isSearchOpen && (
          <div className="sm:hidden py-4 border-t border-border">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search fashion items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2" onClick={() => setIsSearchOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (location.pathname === "/") {
                    document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Try On
              </Link>
              <Link 
                to="/browse" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                to="/wardrobe" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Wardrobe
              </Link>
              <Link 
                to="/social" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Social
              </Link>
              <Link 
                to="/wishlist" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              <div className="pt-2">
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleTryNowClick();
                  }}
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