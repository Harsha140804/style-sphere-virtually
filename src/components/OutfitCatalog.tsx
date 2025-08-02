import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Outfit {
  id: string;
  name: string;
  image: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  brand: string;
  price: number;
  platform: string;
}

interface OutfitCatalogProps {
  gender: 'male' | 'female';
  onOutfitSelect: (outfit: Outfit) => void;
  isProcessing: boolean;
}

// Mock clothing data - only individual clothing items
const mockOutfits: Outfit[] = [
  // Female clothing
  {
    id: 'f1',
    name: 'Floral Summer Dress',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    category: 'Dresses',
    gender: 'female',
    brand: 'Zara',
    price: 2999,
    platform: 'Myntra'
  },
  {
    id: 'f2',
    name: 'Elegant Black Dress',
    image: 'https://images.unsplash.com/photo-1566479179817-48b5e8a8fcf9?w=300&h=400&fit=crop',
    category: 'Dresses',
    gender: 'female',
    brand: 'Mango',
    price: 4999,
    platform: 'Flipkart'
  },
  {
    id: 'f3',
    name: 'Red Party Dress',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    category: 'Dresses',
    gender: 'female',
    brand: 'H&M',
    price: 3499,
    platform: 'Amazon'
  },
  {
    id: 'f4',
    name: 'Blue Casual Top',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
    category: 'Tops',
    gender: 'female',
    brand: 'Forever 21',
    price: 1799,
    platform: 'Myntra'
  },
  {
    id: 'f5',
    name: 'White Blouse',
    image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=300&h=400&fit=crop',
    category: 'Blouses',
    gender: 'female',
    brand: 'Zara',
    price: 2299,
    platform: 'Flipkart'
  },
  {
    id: 'f6',
    name: 'Yellow Summer Top',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop',
    category: 'Tops',
    gender: 'female',
    brand: 'Mango',
    price: 1999,
    platform: 'Amazon'
  },
  // Male clothing
  {
    id: 'm1',
    name: 'Classic White Shirt',
    image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=300&h=400&fit=crop',
    category: 'Shirts',
    gender: 'male',
    brand: 'Van Heusen',
    price: 1999,
    platform: 'Amazon'
  },
  {
    id: 'm2',
    name: 'Navy Blue T-Shirt',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    category: 'T-Shirts',
    gender: 'male',
    brand: 'Nike',
    price: 1299,
    platform: 'Flipkart'
  },
  {
    id: 'm3',
    name: 'Black Formal Shirt',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=400&fit=crop',
    category: 'Shirts',
    gender: 'male',
    brand: 'Arrow',
    price: 2299,
    platform: 'Myntra'
  },
  {
    id: 'm4',
    name: 'Casual Polo Shirt',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=400&fit=crop',
    category: 'Polo',
    gender: 'male',
    brand: 'Ralph Lauren',
    price: 3499,
    platform: 'Amazon'
  },
  {
    id: 'm5',
    name: 'Grey Hoodie',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=400&fit=crop',
    category: 'Hoodies',
    gender: 'male',
    brand: 'Adidas',
    price: 2799,
    platform: 'Flipkart'
  },
  {
    id: 'm6',
    name: 'Green Casual Shirt',
    image: 'https://images.unsplash.com/photo-1588117472013-59bb13edafec?w=300&h=400&fit=crop',
    category: 'Shirts',
    gender: 'male',
    brand: 'Levis',
    price: 2499,
    platform: 'Myntra'
  }
];

export const OutfitCatalog = ({ gender, onOutfitSelect, isProcessing }: OutfitCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter outfits based on gender and other criteria
  const filteredOutfits = mockOutfits.filter(outfit => {
    const matchesGender = outfit.gender === gender || outfit.gender === 'unisex';
    const matchesSearch = outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         outfit.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || outfit.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || outfit.platform === selectedPlatform;
    
    return matchesGender && matchesSearch && matchesCategory && matchesPlatform;
  });

  // Sort outfits
  const sortedOutfits = [...filteredOutfits].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'brand':
        return a.brand.localeCompare(b.brand);
      default:
        return 0;
    }
  });

  const toggleFavorite = (outfitId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(outfitId)) {
      newFavorites.delete(outfitId);
    } else {
      newFavorites.add(outfitId);
    }
    setFavorites(newFavorites);
  };

  const categories = [...new Set(mockOutfits.map(outfit => outfit.category))];
  const platforms = [...new Set(mockOutfits.map(outfit => outfit.platform))];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">
          Choose an Outfit for {gender === 'male' ? 'Men' : 'Women'}
        </h2>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search outfits, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="brand">Brand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Showing {sortedOutfits.length} outfits
        </p>
      </Card>

      {/* Outfit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedOutfits.map(outfit => (
          <Card key={outfit.id} className="overflow-hidden group hover:shadow-soft transition-all duration-300">
            <div className="relative">
              <div className="aspect-[3/4] bg-muted">
                <img
                  src={outfit.image}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop&auto=format`;
                  }}
                />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => toggleFavorite(outfit.id)}
              >
                <Heart className={cn(
                  "w-4 h-4",
                  favorites.has(outfit.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} />
              </Button>
              
              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                {outfit.platform}
              </Badge>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium mb-1 line-clamp-1">{outfit.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{outfit.brand}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">₹{outfit.price.toLocaleString()}</span>
                <Badge variant="secondary">{outfit.category}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => onOutfitSelect(outfit)}
                  disabled={isProcessing}
                  className="flex-1"
                  size="sm"
                >
                  {isProcessing ? 'Processing...' : 'Try On'}
                </Button>
                
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedOutfits.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No outfits found</h3>
            <p>Try adjusting your search or filters to find more options.</p>
          </div>
        </Card>
      )}
    </div>
  );
};