import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, BarChart3, Shirt, Package, Camera } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Wardrobe = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const wardrobeItems = [
    { id: 1, name: "Blue Denim Jacket", type: "Outerwear", occasion: "Casual", season: "Fall", worn: 12, image: "/placeholder.svg" },
    { id: 2, name: "Black Dress", type: "Dresses", occasion: "Formal", season: "All", worn: 8, image: "/placeholder.svg" },
    { id: 3, name: "White Sneakers", type: "Shoes", occasion: "Casual", season: "All", worn: 25, image: "/placeholder.svg" },
    { id: 4, name: "Striped Sweater", type: "Tops", occasion: "Casual", season: "Winter", worn: 15, image: "/placeholder.svg" },
  ];

  const savedOutfits = [
    { id: 1, name: "Weekend Casual", items: ["Blue Denim Jacket", "White T-Shirt", "Black Jeans"], lastWorn: "2024-01-15" },
    { id: 2, name: "Office Meeting", items: ["Black Blazer", "White Blouse", "Gray Trousers"], lastWorn: "2024-01-10" },
    { id: 3, name: "Date Night", items: ["Black Dress", "High Heels", "Statement Necklace"], lastWorn: "2024-01-08" },
  ];

  const wardrobeStats = {
    totalItems: wardrobeItems.length,
    composition: {
      casual: 60,
      formal: 25,
      workout: 15
    },
    underutilized: wardrobeItems.filter(item => item.worn < 5).length
  };

  const handleAddItem = () => {
    toast({
      title: "Add Item",
      description: "Camera function would open to add physical wardrobe items"
    });
  };

  const handleCreateOutfit = () => {
    toast({
      title: "Create Outfit",
      description: "Outfit planner opened - drag and drop items to create outfits"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Smart Wardrobe</h1>
          <p className="text-muted-foreground mb-6">Manage your digital wardrobe and plan outfits</p>
        </div>

        <Tabs defaultValue="all-items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-items">All Items</TabsTrigger>
            <TabsTrigger value="outfits">Outfits</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="all-items" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
                <Button variant="outline" onClick={handleAddItem}>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="outline">Total: {wardrobeStats.totalItems}</Badge>
                <Badge variant="secondary">Underutilized: {wardrobeStats.underutilized}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wardrobeItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-background/80 rounded-full px-2 py-1">
                        <span className="text-xs font-medium">Worn {item.worn}x</span>
                      </div>
                    </div>
                    <CardTitle className="text-sm">{item.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{item.occasion}</Badge>
                      <Badge variant="outline" className="text-xs">{item.season}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="outfits" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Saved Outfits</h2>
              <Button onClick={handleCreateOutfit}>
                <Plus className="w-4 h-4 mr-2" />
                Create Outfit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedOutfits.map((outfit) => (
                <Card key={outfit.id} className="hover:shadow-elegant transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shirt className="w-5 h-5" />
                      {outfit.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {outfit.items.map((item, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {item}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Last worn: {outfit.lastWorn}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">Wear Today</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Wardrobe Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Casual</span>
                      <span>{wardrobeStats.composition.casual}%</span>
                    </div>
                    <Progress value={wardrobeStats.composition.casual} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Formal</span>
                      <span>{wardrobeStats.composition.formal}%</span>
                    </div>
                    <Progress value={wardrobeStats.composition.formal} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Workout</span>
                      <span>{wardrobeStats.composition.workout}%</span>
                    </div>
                    <Progress value={wardrobeStats.composition.workout} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Usage Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Items</span>
                      <span className="font-semibold">{wardrobeStats.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Underutilized</span>
                      <span className="font-semibold text-destructive">{wardrobeStats.underutilized}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Most Worn</span>
                      <span className="font-semibold">White Sneakers (25x)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <p className="font-medium">Try wearing your Black Dress more!</p>
                      <p className="text-muted-foreground">Only worn 8 times</p>
                    </div>
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <p className="font-medium">Consider adding more formal pieces</p>
                      <p className="text-muted-foreground">Only 25% of your wardrobe</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Wardrobe;