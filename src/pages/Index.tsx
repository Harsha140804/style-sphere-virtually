import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { VirtualTryOn } from "@/components/VirtualTryOn";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <section id="try-on" className="py-12 bg-muted/30">
          <VirtualTryOn />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
