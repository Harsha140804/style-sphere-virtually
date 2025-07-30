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

// Mock outfit data
const mockOutfits: Outfit[] = [
  {
    id: '1',
    name: 'Classic White Shirt',
    image: '/api/placeholder/300/400',
    category: 'Shirts',
    gender: 'unisex',
    brand: 'H&M',
    price: 1499,
    platform: 'Myntra'
  },
  {
    id: '2',
    name: 'Denim Jacket',
    image: '/api/placeholder/300/400',
    category: 'Jackets',
    gender: 'unisex',
    brand: 'Levi\'s',
    price: 3999,
    platform: 'Amazon'
  },
  {
    id: '3',
    name: 'Floral Summer Dress',
    image: '/api/placeholder/300/400',
    category: 'Dresses',
    gender: 'female',
    brand: 'Zara',
    price: 2899,
    platform: 'Flipkart'
  },
  {
    id: '4',
    name: 'Casual T-Shirt',
    image: '/api/placeholder/300/400',
    category: 'T-Shirts',
    gender: 'male',
    brand: 'Nike',
    price: 1299,
    platform: 'Myntra'
  },
  {
    id: '5',
    name: 'Formal Blazer',
    image: '/api/placeholder/300/400',
    category: 'Blazers',
    gender: 'male',
    brand: 'Raymond',
    price: 5999,
    platform: 'Amazon'
  },
  {
    id: '6',
    name: 'Maxi Dress',
    image: '/api/placeholder/300/400',
    category: 'Dresses',
    gender: 'female',
    brand: 'Forever 21',
    price: 2299,
    platform: 'Myntra'
  },
  {
    id: '7',
    name: 'Chino Pants',
    image: '/api/placeholder/300/400',
    category: 'Pants',
    gender: 'male',
    brand: 'Uniqlo',
    price: 1899,
    platform: 'Flipkart'
  },
  {
    id: '8',
    name: 'Crop Top',
    image: '/api/placeholder/300/400',
    category: 'Tops',
    gender: 'female',
    brand: 'Urban Outfitters',
    price: 999,
    platform: 'Amazon'
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