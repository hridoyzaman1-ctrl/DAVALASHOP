import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLandingPageSection } from "@/hooks/useLandingPageSections";
import { useSettings } from "@/contexts/SettingsContext";
import skincareCollection from "@/assets/skincare-collection.jpg";
import { useRef, useEffect, useState } from "react";

const EditorialSection = () => {
  const { data: section } = useLandingPageSection("editorial");
  const { t, language } = useSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollY(Math.max(0, Math.min(1, scrollProgress)));
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const image = section?.image_url || skincareCollection;
  const title = language === "bn" ? t("editorial.title") : (section?.title || "Quality Meets Curated Excellence");
  const description = language === "bn" ? t("editorial.description") : (section?.description ||
    "DAVALA is a premier e-commerce destination dedicated to bringing authentic, world-class products directly to you. Currently focusing on the finest skincare and cosmetics, we are rapidly expanding into a full lifestyle platform. Every product in our collection is chosen with a simple standard: uncompromising quality and proven results.");
  const ctaText = language === "bn" ? t("editorial.cta") : (section?.cta_text || "Discover our mission");
  const ctaLink = section?.cta_link || "/about/our-story";

  const parallaxOffset = (scrollY - 0.5) * 30;

  return (
    <section ref={sectionRef} className="w-full mb-16 px-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text content with fade-in animation */}
        <div className={`space-y-4 max-w-[630px] transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
          <h2 className="text-2xl font-normal text-foreground leading-tight md:text-xl">
            {title}
          </h2>
          <p className={`text-sm font-light text-foreground leading-relaxed transition-all duration-700 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
            {description}
          </p>
          <Link
            to={ctaLink}
            className={`inline-flex items-center gap-2 text-sm font-light text-foreground hover:text-primary transition-all duration-300 group ${isVisible ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <span className="border-b border-transparent group-hover:border-primary transition-all">{ctaText}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Image with parallax effect */}
        <div className={`order-first md:order-last transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
          <div className="w-full aspect-square overflow-hidden rounded-lg relative group">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
