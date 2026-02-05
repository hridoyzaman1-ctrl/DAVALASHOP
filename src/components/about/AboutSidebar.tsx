import { NavLink } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

const AboutSidebar = () => {
  const { t, language } = useSettings();

  const aboutPages = [
    { name: language === "bn" ? t("about.our_story") : "Our Story", path: '/about/our-story' },
    { name: language === "bn" ? t("about.sustainability") : "Sustainability", path: '/about/sustainability' },
    { name: language === "bn" ? t("about.size_guide") : "Shade Guide", path: '/about/shade-guide' },
    { name: language === "bn" ? t("about.customer_care") : "Customer Care", path: '/about/customer-care' },
    { name: language === "bn" ? t("about.store_locator") : "Store Locator", path: '/about/store-locator' }
  ];

  return (
    <aside className="hidden md:block w-64 sticky top-32 h-fit px-6">
      <nav className="space-y-1">
        <h3 className="text-lg font-light text-foreground mb-6">{t("about.title")}</h3>
        {aboutPages.map((page) => (
          <NavLink
            key={page.path}
            to={page.path}
            className={({ isActive }) =>
              `block py-2 text-sm font-light transition-all ${isActive
                ? 'text-primary underline decoration-2 underline-offset-4'
                : 'text-muted-foreground hover:text-foreground hover:underline hover:decoration-1 hover:underline-offset-4'
              }`
            }
          >
            {page.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AboutSidebar;