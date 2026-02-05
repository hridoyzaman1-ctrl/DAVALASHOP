import { ArrowRight, X, LogIn, LogOut, Heart, User, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Instagram, Facebook, Send } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useCategories } from "@/hooks/useCategories";
import ShoppingBag from "./ShoppingBag";
import ThemeLanguageToggle from "./ThemeLanguageToggle";
import ProductSearch from "./ProductSearch";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import skincareCollection from "@/assets/skincare-collection.jpg";
import makeupCollection from "@/assets/makeup-collection.jpg";
import serumProduct from "@/assets/serum-product.jpg";
import creamProduct from "@/assets/cream-product.jpg";

const Navigation = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { t, language, contactInfo } = useSettings();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Build shop submenu items from database categories
  const shopSubmenuItems = useMemo(() => {
    if (!categories) return { items: [], links: [] };

    // Sort by sort_order and filter active categories
    const activeCategories = categories
      .filter(cat => cat.is_active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Add "All Products" first
    const allProductsLabel = language === "bn" ? "সব পণ্য" : "All Products";
    const items = [allProductsLabel];
    const links = ["all"];

    // Add categories
    activeCategories.forEach(cat => {
      items.push(cat.name);
      links.push(cat.slug);
    });

    return { items, links };
  }, [categories, language]);

  const navItems = [
    {
      name: t("nav.shop"),
      href: "/category/all",
      submenuItems: shopSubmenuItems.items,
      submenuLinks: shopSubmenuItems.links,
      images: [
        { src: skincareCollection, alt: "Skincare Collection", label: language === "bn" ? "স্কিনকেয়ার" : "Skincare" },
        { src: makeupCollection, alt: "Makeup Collection", label: language === "bn" ? "লিপ কেয়ার" : "Lip Care" }
      ]
    },
    {
      name: t("nav.new_in"),
      href: "/category/all",
      submenuItems: language === "bn"
        ? [t("menu.new_arrivals"), "বেস্টসেলার", "ওরাল কেয়ার", t("menu.gift_sets"), "লিপ কেয়ার"]
        : ["New Arrivals", "Best Selling", "Oral Care", "Gift Sets", "Lip Care"],
      submenuLinks: ["new-arrivals", "best-selling", "oral-care", "gift-sets", "lips"],
      images: [
        { src: serumProduct, alt: "New Serum", label: language === "bn" ? "নতুন পণ্য" : "New Arrivals" },
        { src: creamProduct, alt: "New Cream", label: language === "bn" ? "বেস্টসেলার" : "Best Selling" }
      ]
    },
    {
      name: t("nav.about"),
      href: "/about/our-story",
      submenuItems: language === "bn"
        ? [t("menu.our_story"), t("menu.sustainability"), "শেড গাইড", t("menu.customer_care"), "স্টোর লোকেটর"]
        : ["Our Story", "Sustainability", "Shade Guide", "Customer Care", "Store Locator"],
      submenuLinks: ["our-story", "sustainability", "size-guide", "customer-care", "store-locator"],
      images: [
        { src: skincareCollection, alt: "DAVALA Mission", label: t("general.discover_mission") }
      ]
    }
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="relative bg-background/95 dark:bg-background/95 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Left side - Mobile: hamburger + theme toggle */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              className="p-2 text-foreground hover:text-muted-foreground transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                  <span className="block w-5 h-px bg-current"></span>
                  <span className="block w-5 h-px bg-current"></span>
                  <span className="block w-5 h-px bg-current"></span>
                </div>
              )}
            </button>
            <ThemeLanguageToggle showOnlyTheme />
            <ThemeLanguageToggle showOnlyLanguage />
          </div>

          {/* Left navigation - Desktop only */}
          <div className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.href}
                  className="text-foreground hover:text-muted-foreground transition-colors duration-200 text-sm font-light py-6 block"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Center logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="block"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="text-xl font-light tracking-widest text-foreground">DAVALA</span>
            </Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <div className="hidden lg:block">
              <ThemeLanguageToggle />
            </div>
            {/* Mobile language toggle moved to left side */}

            {isAdmin && (
              <Link
                to="/admin/products"
                className="hidden lg:block p-2 text-primary hover:text-primary/80 transition-colors duration-200 text-xs font-medium"
              >
                {t("nav.admin")}
              </Link>
            )}
            {!user ? (
              <Link
                to="/auth"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                {language === 'bn' ? 'লগইন' : 'Login'}
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  {language === 'bn' ? 'লগআউট' : 'Logout'}
                </button>
              </div>
            )}
            {/* Mobile user icon */}
            {!user ? (
              <Link
                to="/auth"
                className="lg:hidden p-2 text-foreground hover:text-muted-foreground transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/profile"
                className="lg:hidden p-2 text-foreground hover:text-muted-foreground transition-colors duration-200"
                aria-label={t("nav.profile")}
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              className="p-2 text-foreground hover:text-muted-foreground transition-colors duration-200"
              aria-label={t("nav.search")}
              onClick={() => setIsSearchOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            <button
              className="hidden lg:block p-2 text-foreground hover:text-muted-foreground transition-colors duration-200"
              aria-label={t("nav.favorites")}
              onClick={() => {
                if (!user) {
                  setShowAuthPrompt(true);
                } else {
                  setOffCanvasType('favorites');
                }
              }}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-foreground hover:text-muted-foreground transition-colors duration-200 relative"
              aria-label={t("nav.cart")}
              onClick={() => setIsShoppingBagOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-foreground pointer-events-none">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop dropdown menu */}
        {activeDropdown && (
          <div
            className="absolute top-full left-0 right-0 bg-background border-b border-border z-50"
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="px-6 py-8">
              <div className="flex justify-between w-full">
                <div className="flex-1">
                  <ul className="space-y-2">
                    {navItems
                      .find(item => item.name === activeDropdown)
                      ?.submenuItems.map((subItem, index) => {
                        const parentItem = navItems.find(item => item.name === activeDropdown);
                        const link = parentItem?.submenuLinks[index] || subItem.toLowerCase().replace(/\s+/g, '-');
                        const isAbout = activeDropdown === t("nav.about");

                        return (
                          <li key={index}>
                            <Link
                              to={isAbout ? `/about/${link}` : `/category/${link}`}
                              className="text-foreground hover:text-muted-foreground transition-colors duration-200 text-sm font-light block py-2"
                            >
                              {subItem}
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
                <div className="flex space-x-6">
                  {navItems
                    .find(item => item.name === activeDropdown)
                    ?.images.map((image, index) => {
                      let linkTo = "/";
                      if (activeDropdown === t("nav.shop")) {
                        if (index === 0) linkTo = "/category/skincare";
                        else if (index === 1) linkTo = "/category/lip-care";
                      } else if (activeDropdown === t("nav.about")) {
                        linkTo = "/about/our-story";
                      }

                      return (
                        <Link key={index} to={linkTo} className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                          />
                          <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
                            <span>{image.label}</span>
                            <ArrowRight size={12} />
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE MENU - Full screen overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] bg-background">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <button
              className="p-2 text-foreground"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Link
              to="/"
              onClick={() => {
                closeMobileMenu();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xl font-light tracking-widest text-foreground"
            >
              DAVALA
            </Link>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Mobile menu content */}
          <div className="h-[calc(100dvh-64px)] flex flex-col pb-20">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Admin Dashboard - Show FIRST for admins */}
              {isAdmin && (
                <Link
                  to="/admin/products"
                  className="flex items-center gap-3 text-primary font-medium text-xl py-3 px-4 bg-primary/10 rounded-lg border border-primary/20"
                  onClick={closeMobileMenu}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  {t("nav.admin_dashboard")}
                </Link>
              )}

              {/* Navigation items */}
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className="text-foreground text-xl font-light block py-2"
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                  <div className="mt-2 pl-4 space-y-1">
                    {item.submenuItems.map((subItem, subIndex) => {
                      const link = item.submenuLinks[subIndex] || subItem.toLowerCase().replace(/\s+/g, '-');
                      const isAbout = item.name === t("nav.about");

                      return (
                        <Link
                          key={subIndex}
                          to={isAbout ? `/about/${link}` : `/category/${link}`}
                          className="text-muted-foreground hover:text-foreground text-base block py-1.5"
                          onClick={closeMobileMenu}
                        >
                          {subItem}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Favorites link */}
              <button
                onClick={() => {
                  closeMobileMenu();
                  if (!user) {
                    setShowAuthPrompt(true);
                  } else {
                    setOffCanvasType('favorites');
                  }
                }}
                className="flex items-center gap-3 text-foreground text-xl font-light py-2 w-full text-left"
              >
                <Heart size={20} />
                {language === 'bn' ? 'ফেভারিট' : 'Favorites'}
              </button>

              {/* Profile link - only for logged in users */}
              {user && (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 text-foreground text-xl font-light py-2 w-full"
                  onClick={closeMobileMenu}
                >
                  <User size={20} />
                  {language === 'bn' ? 'প্রোফাইল' : 'My Profile'}
                </Link>
              )}
            </div>

            {/* Bottom section (Auth + Socials) - Fixed at bottom if enough space */}
            <div className="p-6 bg-muted/20 border-t border-border mt-auto relative">
              {/* Visual Scroll Indicator */}
              <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none lg:hidden">
                <div className="animate-bounce bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-border/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="m7 13 5 5 5-5" />
                    <path d="m7 6 5 5 5-5" />
                  </svg>
                </div>
              </div>

              <div className="space-y-6">
                {/* Auth section */}
                <div className="space-y-4">
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground text-lg font-light py-2 w-full text-left"
                    >
                      <LogOut size={20} />
                      {language === 'bn' ? 'লগআউট' : 'Logout'}
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex items-center gap-3 text-primary font-medium text-lg py-2"
                      onClick={closeMobileMenu}
                    >
                      <LogIn size={20} />
                      {language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Sign Up'}
                    </Link>
                  )}
                </div>

                {/* Social Links Section */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-4">
                    {language === 'bn' ? 'আমাদের সাথে যুক্ত হন' : 'Connect with Us'}
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={contactInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-background border border-border rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} strokeWidth={1.5} />
                    </a>
                    <a
                      href={contactInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-background border border-border rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} strokeWidth={1.5} />
                    </a>
                    <a
                      href={contactInfo.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-background border border-border rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                      aria-label="TikTok"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-background border border-border rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                      aria-label="WhatsApp"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 scale-95"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      <ProductSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Shopping Bag */}
      <ShoppingBag
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
        onViewFavorites={() => {
          setIsShoppingBagOpen(false);
          if (user) {
            setOffCanvasType('favorites');
          } else {
            setShowAuthPrompt(true);
          }
        }}
      />

      {/* Favorites Off-canvas */}
      <FavoritesPanel
        isOpen={offCanvasType === 'favorites'}
        onClose={() => setOffCanvasType(null)}
        t={t}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action={language === 'bn' ? 'ফেভারিটে যোগ করতে' : 'add to favorites'}
      />
    </>
  );
};

// Favorites Panel Component
interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const FavoritesPanel = ({ isOpen, onClose, t }: FavoritesPanelProps) => {
  const { data: wishlistItems, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-light text-foreground">{t("bag.your_favorites")}</h2>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : wishlistItems && wishlistItems.length > 0 ? (
            <div className="p-4 space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 border border-border rounded-lg">
                  <Link to={`/product/${item.products?.id}`} onClick={onClose}>
                    <img
                      src={item.products?.image_url || '/placeholder.svg'}
                      alt={item.products?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.products?.id}`}
                      onClick={onClose}
                      className="font-medium text-foreground hover:text-primary line-clamp-2"
                    >
                      {item.products?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      ৳{item.products?.price?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromWishlist.mutate(item.product_id)}
                      className="text-xs text-destructive hover:underline mt-2"
                      disabled={removeFromWishlist.isPending}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 p-6 flex items-center justify-center h-full">
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  {t("bag.no_favorites")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
