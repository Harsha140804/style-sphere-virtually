import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ProductScraper = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedCount, setScrapedCount] = useState(0);
  const { toast } = useToast();

  const handleScrape = async () => {
    setIsLoading(true);
    setScrapedCount(0);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-products', {
        body: {
          categories: ["men clothing", "women clothing", "kids clothing"],
          numPages: 2
        }
      });

      if (error) throw error;

      setScrapedCount(data.products?.length || 0);
      toast({
        title: "Scraping Complete",
        description: `Successfully scraped ${data.products?.length || 0} products from Amazon and Flipkart`,
      });
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <ShoppingBag className="w-12 h-12 text-primary" />
        <h3 className="text-lg font-semibold">Product Scraper</h3>
        <p className="text-sm text-muted-foreground text-center">
          Scrape latest products from Amazon and Flipkart
        </p>
        
        {scrapedCount > 0 && (
          <p className="text-sm font-medium text-primary">
            Last scrape: {scrapedCount} products
          </p>
        )}

        <Button
          onClick={handleScrape}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            "Start Scraping"
          )}
        </Button>
      </div>
    </Card>
  );
};