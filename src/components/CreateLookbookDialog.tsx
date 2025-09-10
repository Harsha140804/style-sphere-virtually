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

interface CreateLookbookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lookbook: any) => void;
}

export const CreateLookbookDialog: React.FC<CreateLookbookDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { getClothingItems } = useWardrobe();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const clothingItems = getClothingItems();

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a lookbook name.",
        variant: "destructive"
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one clothing item for the lookbook.",
        variant: "destructive"
      });
      return;
    }

    const newLookbook = {
      id: Date.now(),
      name: name.trim(),
      items: selectedItems.length,
      visibility,
      image: "/placeholder.svg",
      selectedItemIds: selectedItems
    };

    onSave(newLookbook);
    resetForm();
    onClose();

    toast({
      title: "Lookbook Created",
      description: `${name} has been created with ${selectedItems.length} clothing items!`
    });
  };

  const resetForm = () => {
    setName('');
    setVisibility('public');
    setSelectedItems([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Lookbook</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="name">Lookbook Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Essentials"
                required
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Label className="text-base font-medium">Select Clothing Items ({selectedItems.length} selected)</Label>
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
                          </div>
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
              Create Lookbook
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};