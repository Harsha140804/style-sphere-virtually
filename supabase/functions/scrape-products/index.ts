import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  title: string;
  price: string;
  rating: string;
  category: string;
  platform: string;
  image_url?: string;
  product_url?: string;
}

async function scrapeAmazon(searchQuery: string, numPages: number = 2): Promise<Product[]> {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
    "Accept-Language": "en-IN,en;q=0.9"
  };
  const products: Product[] = [];

  for (let page = 1; page <= numPages; page++) {
    try {
      const url = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&page=${page}`;
      console.log(`Scraping Amazon: ${url}`);
      
      const response = await fetch(url, { headers });
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      
      if (!doc) {
        console.error("Failed to parse Amazon HTML");
        continue;
      }

      const results = doc.querySelectorAll('[data-component-type="s-search-result"]');
      console.log(`Found ${results.length} Amazon products on page ${page}`);
      
      for (const item of results) {
        try {
          const titleElement = item.querySelector("h2");
          const title = titleElement?.textContent?.trim() || "No Title";
          
          const priceWhole = item.querySelector(".a-price-whole");
          const priceFraction = item.querySelector(".a-price-fraction");
          const price = (priceWhole?.textContent || "") + (priceFraction?.textContent || "");
          
          const ratingElement = item.querySelector(".a-icon-alt");
          const rating = ratingElement?.textContent || "No Rating";
          
          const imageElement = item.querySelector("img.s-image");
          const image_url = imageElement?.getAttribute("src") || undefined;
          
          const linkElement = item.querySelector("h2 a");
          const product_url = linkElement?.getAttribute("href") 
            ? `https://www.amazon.in${linkElement.getAttribute("href")}`
            : undefined;

          if (title !== "No Title") {
            products.push({
              category: searchQuery,
              title,
              price: price || "Price not available",
              rating,
              platform: "Amazon",
              image_url,
              product_url
            });
          }
        } catch (error) {
          console.error("Error parsing Amazon item:", error);
        }
      }
      
      // Delay between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping Amazon page ${page}:`, error);
    }
  }

  return products;
}

async function scrapeFlipkart(searchQuery: string, numPages: number = 2): Promise<Product[]> {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
  };
  const products: Product[] = [];

  for (let page = 1; page <= numPages; page++) {
    try {
      const url = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
      console.log(`Scraping Flipkart: ${url}`);
      
      const response = await fetch(url, { headers });
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      
      if (!doc) {
        console.error("Failed to parse Flipkart HTML");
        continue;
      }

      // Flipkart has various selectors, trying multiple patterns
      const containers = doc.querySelectorAll('[class*="_1AtVbE"], [class*="_13oc-S"], [class*="_2kHMtA"]');
      console.log(`Found ${containers.length} Flipkart products on page ${page}`);
      
      for (const container of containers) {
        try {
          const titleElement = container.querySelector('[class*="_4rR01T"], [class*="s1Q9rs"], [class*="_2WkVRV"]');
          const title = titleElement?.textContent?.trim();
          
          const priceElement = container.querySelector('[class*="_30jeq3"], [class*="_3I9_wc"]');
          const price = priceElement?.textContent?.trim();
          
          const ratingElement = container.querySelector('[class*="_3LWZlK"]');
          const rating = ratingElement?.textContent?.trim() || "No Rating";
          
          const imageElement = container.querySelector("img");
          const image_url = imageElement?.getAttribute("src") || undefined;
          
          const linkElement = container.querySelector("a");
          const product_url = linkElement?.getAttribute("href")
            ? `https://www.flipkart.com${linkElement.getAttribute("href")}`
            : undefined;

          if (title && price) {
            products.push({
              category: searchQuery,
              title,
              price,
              rating,
              platform: "Flipkart",
              image_url,
              product_url
            });
          }
        } catch (error) {
          console.error("Error parsing Flipkart item:", error);
        }
      }
      
      // Delay between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping Flipkart page ${page}:`, error);
    }
  }

  return products;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { categories = ["men clothing", "women clothing", "kids clothing"], numPages = 2 } = await req.json();
    
    console.log("Starting product scraping for categories:", categories);
    
    const allProducts: Product[] = [];
    
    for (const category of categories) {
      console.log(`\nScraping category: ${category}`);
      
      // Scrape Amazon
      const amazonProducts = await scrapeAmazon(category, numPages);
      console.log(`Amazon scraped: ${amazonProducts.length} products`);
      allProducts.push(...amazonProducts);
      
      // Scrape Flipkart
      const flipkartProducts = await scrapeFlipkart(category, numPages);
      console.log(`Flipkart scraped: ${flipkartProducts.length} products`);
      allProducts.push(...flipkartProducts);
    }

    console.log(`\nTotal products scraped: ${allProducts.length}`);

    // Insert products into database
    if (allProducts.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .insert(allProducts)
        .select();

      if (error) {
        console.error("Error inserting products:", error);
        throw error;
      }

      console.log(`Successfully inserted ${data?.length || 0} products into database`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped and stored ${allProducts.length} products`,
        products: allProducts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in scrape-products function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});