import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { VirtualTryOn } from "@/components/VirtualTryOn";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <section id="try-on" className="py-12 bg-muted/30">
          <VirtualTryOn />
        </section>
        {!user && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Sign up to save your looks, build your wardrobe, and connect with the fashion community.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="default">
                  Get Started
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
