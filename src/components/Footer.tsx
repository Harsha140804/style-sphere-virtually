import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-fashion-teal text-white">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold">Style Sphere</span>
            </div>
            <p className="text-white/80 mb-6">
              Revolutionizing fashion with AI-powered virtual try-ons and smart wardrobe management.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Virtual Try-On</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Smart Sizing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Wardrobe Manager</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Style AI</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Social Sharing</a></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Myntra</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Amazon Fashion</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flipkart</a></li>
              <li><a href="#" className="hover:text-white transition-colors">All Brands</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Price Comparison</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>hello@stylesphere.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Fashion District, NYC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/80 text-sm">
            © 2024 Style Sphere. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};