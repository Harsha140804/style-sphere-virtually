import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { wardrobeItems } = useWardrobe();
  const { toast } = useToast();
  
  const [lookbookName, setLookbookName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [visibility, setVisibility] = useState('public');
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
    
    if (!lookbookName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a lookbook name.",
        variant: "destructive"
      });
      return;
    }

    if (!theme.trim()) {
      toast({
        title: "Missing Theme",
        description: "Please specify a theme for your lookbook.",
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

    // Get selected items details
    const selectedItemsDetails = wardrobeItems.filter(item => selectedItems.includes(item.id));
    
    const newLookbook = {
      id: Date.now().toString(),
      name: lookbookName.trim(),
      description: description.trim(),
      theme: theme.trim(),
      visibility,
      items: selectedItems.length,
      image: selectedItemsDetails[0]?.image || "/placeholder.svg",
      selectedItemIds: selectedItems,
      selectedItemsDetails,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      isLiked: false
    };

    onSave(newLookbook);
    resetForm();
    onClose();

    toast({
      title: "Lookbook Created",
      description: `"${lookbookName}" has been created with ${selectedItems.length} clothing items!`
    });
  };

  const resetForm = () => {
    setLookbookName('');
    setDescription('');
    setTheme('');
    setVisibility('public');
    setSelectedItems([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Lookbook</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Organize your favorite clothing items into a themed collection
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lookbookName">Lookbook Name *</Label>
                <Input
                  id="lookbookName"
                  value={lookbookName}
                  onChange={(e) => setLookbookName(e.target.value)}
                  placeholder="e.g., Summer Essentials"
                  required
                />
              </div>

              <div>
                <Label htmlFor="theme">Theme *</Label>
                <Select value={theme} onValueChange={setTheme} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="beach">Beach/Vacation</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="bohemian">Bohemian</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="streetwear">Streetwear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your lookbook style and inspiration..."
                rows={2}
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
            <Label className="text-base font-medium">
              Select Clothing Items ({selectedItems.length} selected)
            </Label>
            <div className="mt-3 overflow-y-auto max-h-[300px] space-y-3">
              {wardrobeItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No clothing items in your wardrobe.</p>
                  <p className="text-sm text-muted-foreground mt-2">Add some items first!</p>
                </div>
              ) : (
                wardrobeItems.map((item) => (
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
                        
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                            <Badge variant="outline" className="text-xs">{item.occasion}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.brand}</p>
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

          <div className="flex gap-2 pt-4 mt-auto border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!lookbookName.trim() || !theme || selectedItems.length === 0}
            >
              Create Lookbook
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};