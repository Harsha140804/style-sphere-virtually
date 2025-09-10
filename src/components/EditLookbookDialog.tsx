import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useToast } from '@/hooks/use-toast';

interface Lookbook {
  id: number;
  name: string;
  items: number;
  visibility: string;
  image: string;
  selectedItemIds?: string[];
}

interface EditLookbookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lookbookId: number, selectedItems: string[], itemCount: number) => void;
  lookbook: Lookbook | null;
}

export const EditLookbookDialog: React.FC<EditLookbookDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  lookbook
}) => {
  const { getClothingItems } = useWardrobe();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const clothingItems = getClothingItems();

  useEffect(() => {
    if (lookbook) {
      setSelectedItems(lookbook.selectedItemIds || []);
    }
  }, [lookbook]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSave = () => {
    if (lookbook) {
      onSave(lookbook.id, selectedItems, selectedItems.length);
      toast({
        title: "Lookbook Updated",
        description: `${lookbook.name} now has ${selectedItems.length} clothing items!`
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedItems([]);
    onClose();
  };

  return (
    <Dialog open={isOpen && !!lookbook} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit {lookbook?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Label className="text-base font-medium">Select Clothing Items ({selectedItems.length} selected)</Label>
          <div className="mt-3 overflow-y-auto max-h-[500px] space-y-3">
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
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};