import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WardrobeItem {
  id: string;
  name: string;
  type: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear';
  occasion: 'Casual' | 'Formal' | 'Workout' | 'Party';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All';
  worn: number;
  image: string;
  color: string;
  size: string;
  brand: string;
  dateAdded: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: string[]; // Array of item IDs
  lastWorn: string;
  occasion: string;
  image?: string;
}

interface WardrobeContextType {
  wardrobeItems: WardrobeItem[];
  outfits: Outfit[];
  addItem: (item: Omit<WardrobeItem, 'id' | 'worn' | 'dateAdded'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => void;
  addOutfit: (outfit: Omit<Outfit, 'id' | 'lastWorn'>) => void;
  updateOutfit: (id: string, updates: Partial<Outfit>) => void;
  removeOutfit: (id: string) => void;
  wearOutfit: (id: string) => void;
  getClothingItems: () => WardrobeItem[];
  getStats: () => {
    totalItems: number;
    composition: Record<string, number>;
    underutilized: number;
    mostWorn: WardrobeItem | null;
    leastWorn: WardrobeItem[];
  };
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([
    {
      id: '1',
      name: 'Blue Denim Jacket',
      type: 'Outerwear',
      occasion: 'Casual',
      season: 'Fall',
      worn: 12,
      image: '/placeholder.svg',
      color: 'Blue',
      size: 'M',
      brand: 'Levi\'s',
      dateAdded: '2024-01-01'
    },
    {
      id: '2',
      name: 'Black Dress',
      type: 'Dresses',
      occasion: 'Formal',
      season: 'All',
      worn: 8,
      image: '/placeholder.svg',
      color: 'Black',
      size: 'S',
      brand: 'Zara',
      dateAdded: '2024-01-05'
    },
    {
      id: '3',
      name: 'Striped Sweater',
      type: 'Tops',
      occasion: 'Casual',
      season: 'Winter',
      worn: 15,
      image: '/placeholder.svg',
      color: 'White',
      size: 'M',
      brand: 'H&M',
      dateAdded: '2024-01-10'
    },
    {
      id: '4',
      name: 'Black Jeans',
      type: 'Bottoms',
      occasion: 'Casual',
      season: 'All',
      worn: 20,
      image: '/placeholder.svg',
      color: 'Black',
      size: 'M',
      brand: 'Gap',
      dateAdded: '2024-01-15'
    }
  ]);

  const [outfits, setOutfits] = useState<Outfit[]>([
    {
      id: '1',
      name: 'Weekend Casual',
      items: ['1', '3', '4'],
      lastWorn: '2024-01-15',
      occasion: 'Casual'
    },
    {
      id: '2',
      name: 'Office Meeting',
      items: ['2'],
      lastWorn: '2024-01-10',
      occasion: 'Formal'
    }
  ]);

  const addItem = (item: Omit<WardrobeItem, 'id' | 'worn' | 'dateAdded'>) => {
    const newItem: WardrobeItem = {
      ...item,
      id: Date.now().toString(),
      worn: 0,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    setWardrobeItems(prev => [...prev, newItem]);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to your wardrobe!`
    });
  };

  const removeItem = (id: string) => {
    const item = wardrobeItems.find(i => i.id === id);
    setWardrobeItems(prev => prev.filter(i => i.id !== id));
    // Also remove from outfits
    setOutfits(prev => prev.map(outfit => ({
      ...outfit,
      items: outfit.items.filter(itemId => itemId !== id)
    })));
    
    if (item) {
      toast({
        title: "Item Removed",
        description: `${item.name} has been removed from your wardrobe.`
      });
    }
  };

  const updateItem = (id: string, updates: Partial<WardrobeItem>) => {
    setWardrobeItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const addOutfit = (outfit: Omit<Outfit, 'id' | 'lastWorn'>) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: Date.now().toString(),
      lastWorn: new Date().toISOString().split('T')[0]
    };
    
    setOutfits(prev => [...prev, newOutfit]);
    toast({
      title: "Outfit Created",
      description: `${outfit.name} has been saved to your outfits!`
    });
  };

  const updateOutfit = (id: string, updates: Partial<Outfit>) => {
    setOutfits(prev => prev.map(outfit => 
      outfit.id === id ? { ...outfit, ...updates } : outfit
    ));
  };

  const removeOutfit = (id: string) => {
    const outfit = outfits.find(o => o.id === id);
    setOutfits(prev => prev.filter(o => o.id !== id));
    
    if (outfit) {
      toast({
        title: "Outfit Removed",
        description: `${outfit.name} has been removed.`
      });
    }
  };

  const wearOutfit = (id: string) => {
    const outfit = outfits.find(o => o.id === id);
    if (outfit) {
      // Update last worn date
      updateOutfit(id, { lastWorn: new Date().toISOString().split('T')[0] });
      
      // Increment worn count for all items in the outfit
      outfit.items.forEach(itemId => {
        const item = wardrobeItems.find(i => i.id === itemId);
        if (item) {
          updateItem(itemId, { worn: item.worn + 1 });
        }
      });
    }
  };

  const getClothingItems = () => {
    return wardrobeItems;
  };

  const getStats = () => {
    const totalItems = wardrobeItems.length;
    
    // Calculate composition by occasion
    const occasionCounts = wardrobeItems.reduce((acc, item) => {
      acc[item.occasion] = (acc[item.occasion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const composition = Object.entries(occasionCounts).reduce((acc, [occasion, count]) => {
      acc[occasion.toLowerCase()] = Math.round((count / totalItems) * 100);
      return acc;
    }, {} as Record<string, number>);
    
    const underutilized = wardrobeItems.filter(item => item.worn < 5).length;
    const mostWorn = wardrobeItems.reduce((prev, current) => 
      (prev && prev.worn > current.worn) ? prev : current
    );
    const leastWorn = wardrobeItems.filter(item => item.worn < 3);
    
    return {
      totalItems,
      composition,
      underutilized,
      mostWorn: totalItems > 0 ? mostWorn : null,
      leastWorn
    };
  };

  return (
    <WardrobeContext.Provider value={{
      wardrobeItems,
      outfits,
      addItem,
      removeItem,
      updateItem,
      addOutfit,
      updateOutfit,
      removeOutfit,
      wearOutfit,
      getClothingItems,
      getStats
    }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};