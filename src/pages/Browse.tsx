import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TryOnDialog } from "@/components/TryOnDialog";
import { ProductScraper } from "@/components/ProductScraper";
import { supabase } from "@/integrations/supabase/client";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false);
  const [selectedTryOnItem, setSelectedTryOnItem] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const categories = ["All", "men clothing", "women clothing", "kids clothing"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Blue", "Red", "Green", "Pink", "Yellow", "Purple"];
  const brands = ["Zara", "H&M", "Uniqlo", "Forever 21", "Mango", "COS"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };
  
  const filteredItems = products.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.platform?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = selectedSizes.length === 0;
    const matchesColor = selectedColors.length === 0;
    const matchesBrand = selectedBrands.length === 0;
    const matchesPrice = true;
    
    return matchesCategory && matchesSearch && matchesSize && matchesColor && matchesBrand && matchesPrice;
  });

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.image_url || "/placeholder.svg",
      category: item.category
    });
  };

  const handleAddToWishlist = (item: any) => {
    addToWishlist({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.image_url || "/placeholder.svg",
      category: item.category,
      brand: item.platform
    });
  };

  const handleTryOn = (item: any) => {
    setSelectedTryOnItem(item);
    setTryOnDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Browse Fashion</h1>
              <p className="text-muted-foreground">Discover the latest trends and timeless classics</p>
            </div>
            <div className="w-64">
              <ProductScraper />
            </div>
          </div>
          
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
        {isLoadingProducts ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-elegant transition-all duration-300">
                <CardHeader className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                    <img 
                      src={item.image_url || "/placeholder.svg"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background ${
                        isInWishlist(item.id) ? 'text-red-500' : ''
                      }`}
                      onClick={() => handleAddToWishlist(item)}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-primary">{item.price}</span>
                    <Badge variant="secondary">{item.platform}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Category: {item.category}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rating: {item.rating}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
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
        )}

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
            itemName={selectedTryOnItem.title || selectedTryOnItem.name}
            itemImage={selectedTryOnItem.image_url || selectedTryOnItem.image || "/placeholder.svg"}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Browse;