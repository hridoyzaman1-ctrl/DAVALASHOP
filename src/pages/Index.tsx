import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HeroSection from "../components/content/HeroSection";
import LargeHero from "../components/content/LargeHero";
import FiftyFiftySection from "../components/content/FiftyFiftySection";
import OneThirdTwoThirdsSection from "../components/content/OneThirdTwoThirdsSection";
import ProductCarousel from "../components/content/ProductCarousel";
import EditorialSection from "../components/content/EditorialSection";
import DeliveryBanner from "../components/content/DeliveryBanner";

import ParallaxSection from "../components/ui/parallax-section";
import { useSettings } from "@/contexts/SettingsContext";
import CouponBanner from "@/components/layout/CouponBanner";

const Index = () => {
  const { language, t } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="overflow-hidden">
        <CouponBanner />
        <HeroSection />
        <DeliveryBanner />

        {/* FiftyFifty Section */}
        <ParallaxSection speed={0.08} fadeIn className="my-24 md:my-48 relative z-10">
          <FiftyFiftySection />
        </ParallaxSection>

        {/* Product Carousel */}
        <ParallaxSection speed={0.05} fadeIn className="my-24 md:my-48 relative z-20">
          <ProductCarousel />
        </ParallaxSection>

        {/* View All Products Link */}
        <div className="flex justify-center py-20 md:py-32 relative z-20">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 px-12 py-4 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm font-medium tracking-wide bg-background/50 backdrop-blur-sm"
          >
            {language === 'bn' ? 'সকল পণ্য দেখুন' : 'View All Products'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Large Hero */}
        <ParallaxSection speed={0.1} fadeIn className="my-24 md:my-48 relative z-10">
          <LargeHero />
        </ParallaxSection>

        {/* One Third / Two Thirds (Luxe Moisturizers) */}
        <ParallaxSection speed={0.08} fadeIn className="my-24 md:my-48 relative z-10">
          <OneThirdTwoThirdsSection />
        </ParallaxSection>

        {/* Editorial */}
        <ParallaxSection speed={0.05} fadeIn className="my-24 md:my-48 relative z-10">
          <EditorialSection />
        </ParallaxSection>


      </main>

      <Footer />
    </div>
  );
};

export default Index;
