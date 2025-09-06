import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();

  const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];
  
  const mockItems = [
    { id: 1, name: "Floral Summer Dress", category: "Dresses", price: "$89", image: "/placeholder.svg", rating: 4.5 },
    { id: 2, name: "Classic Denim Jacket", category: "Outerwear", price: "$129", image: "/placeholder.svg", rating: 4.8 },
    { id: 3, name: "Silk Blouse", category: "Tops", price: "$75", image: "/placeholder.svg", rating: 4.3 },
    { id: 4, name: "High-Waist Jeans", category: "Bottoms", price: "$95", image: "/placeholder.svg", rating: 4.6 },
    { id: 5, name: "Ankle Boots", category: "Shoes", price: "$150", image: "/placeholder.svg", rating: 4.7 },
    { id: 6, name: "Statement Necklace", category: "Accessories", price: "$45", image: "/placeholder.svg", rating: 4.2 },
  ];

  const filteredItems = mockItems.filter(item => 
    (selectedCategory === "All" || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (itemName: string) => {
    toast({
      title: "Added to Cart",
      description: `${itemName} has been added to your cart!`
    });
  };

  const handleAddToWishlist = (itemName: string) => {
    toast({
      title: "Added to Wishlist",
      description: `${itemName} has been saved to your wishlist!`
    });
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
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 hover:bg-background"
                    onClick={() => handleAddToWishlist(item.name)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{item.price}</span>
                  <Badge variant="secondary">{item.category}</Badge>
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
                    onClick={() => handleAddToCart(item.name)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="sm">
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
      </main>
      <Footer />
    </div>
  );
};

export default Browse;