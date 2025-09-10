import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useState } from "react";

interface BrandSelectorProps {
  children: React.ReactNode;
  onBrandSelect: (brand: string) => void;
}

const popularBrands = [
  "Zara", "H&M", "Mango", "Forever 21", "Nike", "Adidas", "Puma", "Uniqlo",
  "Gap", "Levi's", "Tommy Hilfiger", "Calvin Klein", "Ralph Lauren", "Gucci",
  "Prada", "Louis Vuitton", "Chanel", "Dior", "Burberry", "Versace", "Armani",
  "Hugo Boss", "Michael Kors", "Coach", "Kate Spade", "Tory Burch", "Anthropologie",
  "Urban Outfitters", "Free People", "American Eagle", "Hollister", "Abercrombie"
];

export const BrandSelector = ({ children, onBrandSelect }: BrandSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBrands = popularBrands.filter(brand => 
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBrandSelect = (brand: string) => {
    onBrandSelect(brand);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Brand</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-60 overflow-auto space-y-2">
            {filteredBrands.map((brand) => (
              <Button
                key={brand}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleBrandSelect(brand)}
              >
                {brand}
              </Button>
            ))}
            {filteredBrands.length === 0 && searchTerm && (
              <div className="text-center py-4 text-muted-foreground">
                No brands found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};