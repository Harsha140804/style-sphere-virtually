import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TryOnDialog } from "@/components/TryOnDialog";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false);
  const [selectedTryOnItem, setSelectedTryOnItem] = useState<typeof mockItems[0] | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Blue", "Red", "Green", "Pink", "Yellow", "Purple"];
  const brands = ["Zara", "H&M", "Uniqlo", "Forever 21", "Mango", "COS"];
  
  const mockItems = [
    // Dresses
    { id: 1, name: "Floral Summer Dress", category: "Dresses", price: 7120, priceText: "₹7,120", image: "/placeholder.svg", rating: 4.5, size: "M", color: "Pink", brand: "Zara" },
    { id: 2, name: "Elegant Midi Dress", category: "Dresses", price: 8500, priceText: "₹8,500", image: "/placeholder.svg", rating: 4.6, size: "S", color: "Black", brand: "Mango" },
    { id: 3, name: "Casual Maxi Dress", category: "Dresses", price: 6200, priceText: "₹6,200", image: "/placeholder.svg", rating: 4.4, size: "L", color: "Blue", brand: "H&M" },
    { id: 4, name: "Party Cocktail Dress", category: "Dresses", price: 9800, priceText: "₹9,800", image: "/placeholder.svg", rating: 4.7, size: "M", color: "Red", brand: "Zara" },
    
    // Tops
    { id: 5, name: "Silk Blouse", category: "Tops", price: 6000, priceText: "₹6,000", image: "/placeholder.svg", rating: 4.3, size: "S", color: "White", brand: "Uniqlo" },
    { id: 6, name: "Cotton T-Shirt", category: "Tops", price: 2500, priceText: "₹2,500", image: "/placeholder.svg", rating: 4.1, size: "L", color: "Green", brand: "Uniqlo" },
    { id: 7, name: "Striped Crop Top", category: "Tops", price: 3200, priceText: "₹3,200", image: "/placeholder.svg", rating: 4.2, size: "M", color: "White", brand: "H&M" },
    { id: 8, name: "Formal Shirt", category: "Tops", price: 4500, priceText: "₹4,500", image: "/placeholder.svg", rating: 4.5, size: "S", color: "Blue", brand: "COS" },
    
    // Bottoms
    { id: 9, name: "High-Waist Jeans", category: "Bottoms", price: 7600, priceText: "₹7,600", image: "/placeholder.svg", rating: 4.6, size: "M", color: "Blue", brand: "Zara" },
    { id: 10, name: "Wide Leg Trousers", category: "Bottoms", price: 5800, priceText: "₹5,800", image: "/placeholder.svg", rating: 4.3, size: "L", color: "Black", brand: "Mango" },
    { id: 11, name: "Pleated Skirt", category: "Bottoms", price: 4200, priceText: "₹4,200", image: "/placeholder.svg", rating: 4.4, size: "S", color: "Pink", brand: "H&M" },
    { id: 12, name: "Cargo Pants", category: "Bottoms", price: 6500, priceText: "₹6,500", image: "/placeholder.svg", rating: 4.2, size: "M", color: "Green", brand: "Uniqlo" },
    
    // Outerwear
    { id: 13, name: "Classic Denim Jacket", category: "Outerwear", price: 10320, priceText: "₹10,320", image: "/placeholder.svg", rating: 4.8, size: "L", color: "Blue", brand: "H&M" },
    { id: 14, name: "Leather Jacket", category: "Outerwear", price: 15000, priceText: "₹15,000", image: "/placeholder.svg", rating: 4.9, size: "XL", color: "Black", brand: "Zara" },
    { id: 15, name: "Wool Coat", category: "Outerwear", price: 18500, priceText: "₹18,500", image: "/placeholder.svg", rating: 4.7, size: "M", color: "Black", brand: "COS" },
    { id: 16, name: "Bomber Jacket", category: "Outerwear", price: 8900, priceText: "₹8,900", image: "/placeholder.svg", rating: 4.5, size: "S", color: "Green", brand: "Mango" },
  ];

  const filteredItems = mockItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(item.size);
    const matchesColor = selectedColors.length === 0 || selectedColors.includes(item.color);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
    const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;
    
    return matchesCategory && matchesSearch && matchesSize && matchesColor && matchesBrand && matchesPrice;
  });

  const handleAddToCart = (item: typeof mockItems[0]) => {
    addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.priceText,
      image: item.image,
      category: item.category
    });
  };

  const handleAddToWishlist = (item: typeof mockItems[0]) => {
    addToWishlist({
      id: item.id.toString(),
      name: item.name,
      price: item.priceText,
      image: item.image,
      category: item.category,
      brand: item.brand
    });
  };

  const handleTryOn = (item: typeof mockItems[0]) => {
    setSelectedTryOnItem(item);
    setTryOnDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Browse Fashion</h1>
          <p className="text-muted-foreground mb-6">Discover the latest trends and timeless classics</p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Options</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Size Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Size</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${size}`}
                            checked={selectedSizes.includes(size)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSizes([...selectedSizes, size]);
                              } else {
                                setSelectedSizes(selectedSizes.filter(s => s !== size));
                              }
                            }}
                          />
                          <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Color</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {colors.map((color) => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={selectedColors.includes(color)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedColors([...selectedColors, color]);
                              } else {
                                setSelectedColors(selectedColors.filter(c => c !== color));
                              }
                            }}
                          />
                          <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Brand</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }
                            }}
                          />
                          <Label htmlFor={`brand-${brand}`} className="text-sm">{brand}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedSizes([]);
                      setSelectedColors([]);
                      setSelectedBrands([]);
                      setPriceRange({ min: 0, max: 20000 });
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-elegant transition-all duration-300">
              <CardHeader className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background ${
                      isInWishlist(item.id.toString()) ? 'text-red-500' : ''
                    }`}
                    onClick={() => handleAddToWishlist(item)}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(item.id.toString()) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-primary">{item.priceText}</span>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Size: {item.size}</span>
                    <span>•</span>
                    <span>Color: {item.color}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Brand: {item.brand}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-sm text-muted-foreground">⭐ {item.rating}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTryOn(item)}
                  >
                    Try On
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching your criteria.</p>
          </div>
        )}

        {/* Try-On Dialog */}
        {selectedTryOnItem && (
          <TryOnDialog
            isOpen={tryOnDialogOpen}
            onClose={() => {
              setTryOnDialogOpen(false);
              setSelectedTryOnItem(null);
            }}
            itemName={selectedTryOnItem.name}
            itemImage={selectedTryOnItem.image}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Browse;