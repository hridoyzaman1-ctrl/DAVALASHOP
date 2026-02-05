import { Link } from "react-router-dom";
import { useLandingPageSection } from "@/hooks/useLandingPageSections";
import { useSettings } from "@/contexts/SettingsContext";
import heroCosmetics from "@/assets/hero-cosmetics.jpg";

const LargeHero = () => {
  const { data: section } = useLandingPageSection("large_hero");
  const { t, language } = useSettings();

  const image = section?.image_url || heroCosmetics;
  const title = section?.title || t("category.radiant_essentials");
  const description = section?.description || t("category.radiant_desc");
  const ctaLink = section?.cta_link || "/category/skincare";

  return (
    <section className="w-full mb-16 px-6">
      <Link to={ctaLink} className="block">
        <div className="w-full aspect-[16/9] mb-3 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="">
        <h2 className="text-sm font-normal text-foreground mb-1">
          {title}
        </h2>
        <p className="text-sm font-light text-foreground">
          {description}
        </p>
      </div>
    </section>
  );
};

export default LargeHero;
