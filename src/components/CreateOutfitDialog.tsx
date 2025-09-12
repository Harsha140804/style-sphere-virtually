import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';
import { Shirt, X } from 'lucide-react';

interface CreateOutfitDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOutfitDialog: React.FC<CreateOutfitDialogProps> = ({ isOpen, onClose }) => {
  const { wardrobeItems, addOutfit } = useWardrobe();
  const { toast } = useToast();
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outfitName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an outfit name.",
        variant: "destructive"
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item for the outfit.",
        variant: "destructive"
      });
      return;
    }

    addOutfit({
      name: outfitName.trim(),
      items: selectedItems,
      occasion: occasion || 'Casual'
    });

    toast({
      title: "Outfit Created",
      description: `"${outfitName}" has been created with ${selectedItems.length} items!`
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setOutfitName('');
    setOccasion('');
    setSelectedItems([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getSelectedItemsPreview = () => {
    return selectedItems.map(itemId => 
      wardrobeItems.find(item => item.id === itemId)
    ).filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Create New Outfit
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Combine your wardrobe items to create the perfect outfit
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Outfit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="outfitName">Outfit Name *</Label>
              <Input
                id="outfitName"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g., Weekend Casual, Office Meeting"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Workout">Workout</SelectItem>
                  <SelectItem value="Party">Party</SelectItem>
                  <SelectItem value="Date">Date Night</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Items Preview */}
          {selectedItems.length > 0 && (
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">
                Selected Items ({selectedItems.length})
              </Label>
              <div className="flex flex-wrap gap-2 p-3 bg-accent/30 rounded-lg">
                {getSelectedItemsPreview().map((item) => (
                  <div key={item?.id} className="flex items-center gap-2 bg-background rounded-full px-3 py-1 text-sm">
                    <div className="w-4 h-4 bg-muted rounded-full overflow-hidden">
                      <img src={item?.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>{item?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleItemToggle(item?.id || '')}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item Selection */}
          <div className="flex-1 overflow-hidden">
            <Label className="text-base font-medium mb-3 block">
              Choose Items from Your Wardrobe
            </Label>
            <div className="overflow-y-auto max-h-[400px] space-y-3">
              {wardrobeItems.length === 0 ? (
                <div className="text-center py-8">
                  <Shirt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No items in your wardrobe</p>
                  <p className="text-sm text-muted-foreground">Add some clothing items first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wardrobeItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedItems.includes(item.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                          />
                          
                          <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {item.type}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              <Badge variant="secondary" className="text-xs">{item.color}</Badge>
                              <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.brand}</span>
                              <span>•</span>
                              <span>Worn {item.worn}x</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 mt-auto border-t">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!outfitName.trim() || selectedItems.length === 0}
            >
              Create Outfit ({selectedItems.length} items)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};