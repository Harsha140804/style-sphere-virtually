import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TryOnResult {
  id: number;
  name: string;
  image: string;
  date: string;
}

interface TryOnResultSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: TryOnResult) => void;
  tryOnResults: TryOnResult[];
}

export const TryOnResultSelector: React.FC<TryOnResultSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  tryOnResults
}) => {
  const handleSelect = (result: TryOnResult) => {
    onSelect(result);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Try-On Result</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3">
          {tryOnResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No try-on results available. Create some virtual try-ons first!
            </p>
          ) : (
            tryOnResults.map((result) => (
              <Card 
                key={result.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelect(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm text-muted-foreground">{result.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="pt-4">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};