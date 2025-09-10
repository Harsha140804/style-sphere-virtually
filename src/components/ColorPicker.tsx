import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ColorPickerProps {
  children: React.ReactNode;
  onColorSelect: (color: string) => void;
}

const predefinedColors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Navy", value: "#1e3a8a" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#dc2626" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#9333ea" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Yellow", value: "#eab308" },
  { name: "Orange", value: "#ea580c" },
  { name: "Brown", value: "#a3663c" },
  { name: "Beige", value: "#d6d3d1" },
  { name: "Cream", value: "#fef7ed" },
  { name: "Burgundy", value: "#7c2d12" },
  { name: "Teal", value: "#0d9488" }
];

export const ColorPicker = ({ children, onColorSelect }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Color</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-3 p-4">
          {predefinedColors.map((color) => (
            <Button
              key={color.name}
              variant="outline"
              className="h-16 p-2 flex flex-col items-center gap-1"
              onClick={() => handleColorSelect(color.name)}
            >
              <div 
                className="w-8 h-8 rounded-full border border-border"
                style={{ backgroundColor: color.value }}
              />
              <span className="text-xs">{color.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};