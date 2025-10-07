
export default interface Outfit {
  id: string;
  name: string;
  image: string;
  category?: string; // category is not available in scraped data, make it optional
  gender?: 'male' | 'female' | 'unisex'; // not available in scraped data
  brand: string;
  price: number | null;
  platform: 'Amazon' | 'Flipkart'; // Ensure platform is one of the allowed values
  redirectUrl: string; // The URL to the product page
  // platform: string;
}


