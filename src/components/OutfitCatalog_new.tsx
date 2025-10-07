import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; 
import Outfit from '@/types/Outfit';

// Define the base URL for your scraper API (Assumed to be running on port 3000)
const API_BASE_URL = 'https://3b73k74z-3000.inc1.devtunnels.ms/api';


interface OutfitCatalogProps {
  gender: 'male' | 'female';
  onOutfitSelect: (outfit: Outfit) => Promise<void>;
  isProcessing: boolean;
}

export const OutfitCatalog = ({ gender, onOutfitSelect, isProcessing }: OutfitCatalogProps) => {
  // ------------------------------
  // 1. STATE MANAGEMENT
  // ------------------------------
  const [outfits, setOutfits] = useState<Outfit[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  // State for the debounced query, which triggers API fetch
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); 
  // Track the last successfully fetched query
  const [lastFetchedQuery, setLastFetchedQuery] = useState(''); 

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Available categories (must be relevant to the scraper queries)
  const categories: string[] = ['all', 'T-shirt', 'Jeans', 'Shirt', 'Dress', 'Jacket', 'Shoes'];

  // ------------------------------
  // 2. DEBOUNCE LOGIC (1000ms delay)
  // ------------------------------
  useEffect(() => {
    // Set a timeout to update the debounced query after 1000ms
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000); // 1000ms delay for rebound search

    // Cleanup: clears the timeout if the user types again before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); 

  // ------------------------------
  // 3. DATA FETCHING LOGIC (With AbortController)
  // ------------------------------
  const fetchData = useCallback(async (
    platform: 'amazon' | 'flipkart' | 'combined', 
    query: string,
    signal: AbortSignal // Accepts AbortSignal for cancellation
  ) => {
    if (query === lastFetchedQuery) return;
      
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE_URL}/${platform}?query=${encodeURIComponent(query)}`;
      const response = await fetch(url, { signal }); 
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const products: Outfit[] = data.products.map((p: any) => ({
          ...p,
          platform: p.platform as 'Amazon' | 'Flipkart',
          price: (p.price && p.price > 0) ? p.price : null, 
      }));
      
      setOutfits(products);
      setLastFetchedQuery(query);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted:', query);
        return; 
      }
      
      console.error(`Error fetching data from ${platform}:`, err);
      setError(`Could not fetch data from ${platform}. Error: ${err.message}.`);
      setOutfits([]);
    } finally {
      if (!signal.aborted) {
         setLoading(false);
      }
    }
  }, [lastFetchedQuery]);

  // ------------------------------
  // 4. MAIN EFFECT: TRIGGERS FETCH (Rebound Search & Category Integration)
  // ------------------------------
  useEffect(() => {
    // 1. SETUP ABORT CONTROLLER
    const controller = new AbortController();
    const signal = controller.signal;

    // 2. DETERMINE PLATFORM AND QUERY
    const platform = selectedPlatform === 'all' ? 'combined' : selectedPlatform.toLowerCase();
    
    // Base query is always based on gender
    const baseGenderQuery = `${gender === 'male' ? 'mens' : 'women'} outfit`;
    
    // Construct search query: [Category] [Debounced Search]
    let queryParts = [];
    if (selectedCategory !== 'all') {
        queryParts.push(selectedCategory); // Prepend category
    }
    if (debouncedSearchQuery) {
        queryParts.push(debouncedSearchQuery);
    }
    
    const finalUserQuery = queryParts.join(' ');
    // Final query: Category + Search, or just the base gender query if all search inputs are empty
    const currentQuery = finalUserQuery || baseGenderQuery;


    // 3. REBOUND SEARCH CHECK (Client-Side Filtering)
    let isClientFilterEmpty = false;
    
    if (searchQuery) { // Use the IMMEDIATE searchQuery to filter the existing list
        const currentFilteredOutfits = outfits.filter(outfit =>
            outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            outfit.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
        isClientFilterEmpty = currentFilteredOutfits.length === 0;
    }

    // 4. EXECUTION LOGIC (Decide if a fetch is necessary)
    // A fetch is needed if:
    // a) The query is the base gender query (e.g., initial load or search cleared)
    // b) The client-side filter returned zero results (Rebound Search condition met)
    // c) The platform or category selection changed
    const shouldFetch = 
        currentQuery === baseGenderQuery ||
        isClientFilterEmpty ||   
        currentQuery !== lastFetchedQuery || // Check if the full generated query has changed
        platform !== (selectedPlatform === 'all' ? 'combined' : selectedPlatform.toLowerCase());

    if (shouldFetch) {
        // Only fetch if the current query is different from the last one we fetched successfully
        if (currentQuery !== lastFetchedQuery) {
            fetchData(platform as 'amazon' | 'flipkart' | 'combined', currentQuery, signal);
        }
    }
    
    // 5. CLEANUP: Cancel pending request
    return () => {
      controller.abort();
      if (loading) setLoading(false);
    };

  }, [gender, selectedPlatform, selectedCategory, debouncedSearchQuery, fetchData, outfits, loading, lastFetchedQuery, searchQuery]); // Added searchQuery to dependency array for rebound logic


  // ------------------------------
  // 5. FILTERING AND SORTING (Instant Display Logic)
  // ------------------------------
  const filteredAndSortedOutfits = useMemo(() => {
    let currentOutfits = outfits;
    
    // Client-side filtering based on the IMMEDIATE 'searchQuery' for instant UI update
    if (searchQuery) {
        currentOutfits = currentOutfits.filter(outfit =>
            outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            outfit.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Sort outfits
    return [...currentOutfits].sort((a, b) => {
      const priceA = a.price ?? 999999;
      const priceB = b.price ?? 999999;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        default:
          return 0; // relevance
      }
    });
  }, [outfits, sortBy, searchQuery]); 

  // ... (toggleFavorite logic remains the same)
  const toggleFavorite = (outfitId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(outfitId)) {
      newFavorites.delete(outfitId);
    } else {
      newFavorites.add(outfitId);
    }
    setFavorites(newFavorites);
  };
  
  // ------------------------------
  // 6. RENDERING
  // ------------------------------

  const LoadingCard = () => (
    // ... (LoadingCard component remains the same)
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-1/5" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">
          Search Outfits for {gender === 'male' ? 'Men' : 'Women'}
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
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms (Combined)</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Flipkart">Flipkart</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy} disabled={loading}>
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
          {loading ? 'Fetching results...' : `Showing ${filteredAndSortedOutfits.length} outfits`}
        </p>
      </Card>
      
      {/* Error Message */}
      {error && (
        <Card className="p-4 border-red-500 bg-red-50 text-red-700">
          <p className="font-medium">API Error: {error}</p>
          <p className="text-sm">Please ensure the Node.js scraper API is running on **http://localhost:3000** and CORS is enabled.</p>
        </Card>
      )}

      {/* Outfit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <LoadingCard key={i} />)
        ) : (
          filteredAndSortedOutfits.map(outfit => ( 
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
                  <span className="font-semibold">
                    {outfit.price !== null ? `₹${outfit.price.toLocaleString()}` : 'Price N/A'}
                  </span>
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
                  
                  <Button variant="outline" size="sm" asChild>
                    <a href={outfit.redirectUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {!loading && filteredAndSortedOutfits.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No outfits found</h3>
            <p>Try a different search query, change your platform or category selection.</p>
          </div>
        </Card>
      )}
    </div>
  );
};