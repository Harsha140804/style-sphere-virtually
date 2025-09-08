import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, BarChart3, Shirt, Package, Camera, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWardrobe } from "@/hooks/useWardrobe";
import { AddItemDialog } from "@/components/AddItemDialog";
import { CreateOutfitDialog } from "@/components/CreateOutfitDialog";
import { EditOutfitDialog } from "@/components/EditOutfitDialog";
import { TryOnDialog } from "@/components/TryOnDialog";

const Wardrobe = () => {
  const { toast } = useToast();
  const { wardrobeItems, outfits, removeItem, wearOutfit, getStats } = useWardrobe();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showCreateOutfitDialog, setShowCreateOutfitDialog] = useState(false);
  const [showEditOutfitDialog, setShowEditOutfitDialog] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [showTryOnDialog, setShowTryOnDialog] = useState(false);
  const [selectedOutfitForTryOn, setSelectedOutfitForTryOn] = useState(null);

  const stats = getStats();

  const handleEditOutfit = (outfit) => {
    setEditingOutfit(outfit);
    setShowEditOutfitDialog(true);
  };

  const handleWearToday = (outfit) => {
    setSelectedOutfitForTryOn(outfit);
    setShowTryOnDialog(true);
    // Mark outfit as worn when try-on dialog opens
    wearOutfit(outfit.id);
    toast({
      title: "Outfit Selected",
      description: `${outfit.name} marked as worn today!`
    });
  };

  const getOutfitItems = (outfit) => {
    if (!outfit || !outfit.items) return [];
    return outfit.items.map(itemId => 
      wardrobeItems.find(item => item.id === itemId)
    ).filter(Boolean);
  };

  const getOutfitImage = (outfit) => {
    if (!outfit) return "/placeholder.svg";
    const items = getOutfitItems(outfit);
    return items[0]?.image || "/placeholder.svg";
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
                <Button onClick={() => setShowAddItemDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Badge variant="outline">Total: {stats.totalItems}</Badge>
                <Badge variant="secondary">Underutilized: {stats.underutilized}</Badge>
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
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{item.occasion}</Badge>
                      <Badge variant="outline" className="text-xs">{item.season}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{item.color}</Badge>
                      <Badge variant="outline" className="text-xs">{item.size}</Badge>
                      <Badge variant="outline" className="text-xs">{item.brand}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Remove ${item.name} from wardrobe?`)) {
                          removeItem(item.id);
                        }
                      }}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="outfits" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Saved Outfits</h2>
              <Button onClick={() => setShowCreateOutfitDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Outfit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outfits.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Shirt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No outfits created yet</p>
                  <Button onClick={() => setShowCreateOutfitDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Outfit
                  </Button>
                </div>
              ) : (
                outfits.map((outfit) => (
                  <Card key={outfit.id} className="hover:shadow-elegant transition-shadow duration-300">
                    <CardHeader>
                      <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                        <img 
                          src={getOutfitImage(outfit)} 
                          alt={outfit.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        <Shirt className="w-5 h-5" />
                        {outfit.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {getOutfitItems(outfit).map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-4 h-4 bg-muted rounded flex-shrink-0" />
                            {item?.name || 'Item not found'}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Calendar className="w-3 h-3" />
                        Last worn: {outfit.lastWorn}
                      </div>
                      <Badge variant="outline" className="mb-4">{outfit.occasion}</Badge>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleWearToday(outfit)}
                        >
                          Wear Today
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditOutfit(outfit)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
                  {Object.entries(stats.composition).map(([occasion, percentage]) => (
                    <div key={occasion}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="capitalize">{occasion}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                  {Object.keys(stats.composition).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No items in wardrobe yet
                    </p>
                  )}
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
                      <span className="font-semibold">{stats.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Underutilized</span>
                      <span className="font-semibold text-destructive">{stats.underutilized}</span>
                    </div>
                    {stats.mostWorn && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Most Worn</span>
                        <span className="font-semibold">{stats.mostWorn.name} ({stats.mostWorn.worn}x)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Outfits</span>
                      <span className="font-semibold">{outfits.length}</span>
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
                    {stats.leastWorn.length > 0 && (
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <p className="font-medium">Try wearing your {stats.leastWorn[0].name} more!</p>
                        <p className="text-muted-foreground">Only worn {stats.leastWorn[0].worn} times</p>
                      </div>
                    )}
                    {stats.totalItems < 10 && (
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <p className="font-medium">Build your wardrobe!</p>
                        <p className="text-muted-foreground">Add more items to get better insights</p>
                      </div>
                    )}
                    {stats.underutilized > stats.totalItems * 0.3 && (
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <p className="font-medium">You have many underutilized items</p>
                        <p className="text-muted-foreground">Try creating new outfits with unused pieces</p>
                      </div>
                    )}
                    {outfits.length === 0 && (
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <p className="font-medium">Create your first outfit!</p>
                        <p className="text-muted-foreground">Combine your items to plan looks ahead</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      
      {/* Dialogs */}
      <AddItemDialog 
        isOpen={showAddItemDialog} 
        onClose={() => setShowAddItemDialog(false)} 
      />
      
      <CreateOutfitDialog 
        isOpen={showCreateOutfitDialog} 
        onClose={() => setShowCreateOutfitDialog(false)} 
      />
      
      <EditOutfitDialog 
        isOpen={showEditOutfitDialog} 
        onClose={() => {
          setShowEditOutfitDialog(false);
          setEditingOutfit(null);
        }}
        outfit={editingOutfit}
      />
      
      <TryOnDialog 
        isOpen={showTryOnDialog} 
        onClose={() => {
          setShowTryOnDialog(false);
          setSelectedOutfitForTryOn(null);
        }}
        itemName={selectedOutfitForTryOn?.name || ""}
        itemImage={getOutfitImage(selectedOutfitForTryOn)}
      />
    </div>
  );
};

export default Wardrobe;