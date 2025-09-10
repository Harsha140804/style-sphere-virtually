import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { useWardrobe, type Outfit } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';

interface EditOutfitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: Outfit | null;
}

export const EditOutfitDialog: React.FC<EditOutfitDialogProps> = ({ isOpen, onClose, outfit }) => {
  const { getClothingItems, updateOutfit, removeOutfit } = useWardrobe();
  const { toast } = useToast();
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const clothingItems = getClothingItems();

  useEffect(() => {
    if (outfit) {
      setOutfitName(outfit.name);
      setOccasion(outfit.occasion);
      setSelectedItems(outfit.items);
    } else {
      resetForm();
    }
  }, [outfit]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outfit) return;
    
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

    updateOutfit(outfit.id, {
      name: outfitName,
      items: selectedItems,
      occasion: occasion || 'Casual'
    });

    toast({
      title: "Outfit Updated",
      description: `${outfitName} has been updated successfully!`
    });

    onClose();
  };

  const handleDelete = () => {
    if (!outfit) return;
    
    if (window.confirm(`Are you sure you want to delete "${outfit.name}"?`)) {
      removeOutfit(outfit.id);
      onClose();
    }
  };

  const resetForm = () => {
    setOutfitName('');
    setOccasion('');
    setSelectedItems([]);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen && !!outfit} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Outfit</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="outfitName">Outfit Name *</Label>
              <Input
                id="outfitName"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g., Weekend Casual"
                required
              />
            </div>

            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Workout">Workout</SelectItem>
                  <SelectItem value="Party">Party</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Label className="text-base font-medium">Select Items ({selectedItems.length} selected)</Label>
            <div className="mt-3 overflow-y-auto max-h-[400px] space-y-3">
              {clothingItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No clothing items in your wardrobe. Add some items first!
                </p>
              ) : (
                clothingItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-all ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleItemToggle(item.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemToggle(item.id)}
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
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">{item.color}</Badge>
                            <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                            <Badge variant="outline" className="text-xs">{item.occasion}</Badge>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          Worn {item.worn}x
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4 mt-auto">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};