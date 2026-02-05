import { useSettings } from "@/contexts/SettingsContext";
import { Truck } from "lucide-react";
import NewsletterSection from "./NewsletterSection";

const Footer = () => {
  const { t, contactInfo } = useSettings();

  return (
    <>
      <NewsletterSection />
      <footer className="w-full bg-background text-foreground pt-6 lg:pt-8 pb-4 lg:pb-2 px-6 border-t border-border mt-0">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-6 lg:mb-8">
            {/* Brand - Left side */}
            <div>
              <h2 className="text-2xl font-light tracking-wide text-foreground mb-4">
                DAVALA
              </h2>
              <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-xs md:max-w-md mb-4 lg:mb-6">
                {t("footer.brand_tagline")}
              </p>

              {/* Home Delivery Badge */}
              <div className="flex items-center gap-2 mb-4 lg:mb-6 text-primary">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">{t("footer.home_delivery")}</span>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-x-4 gap-y-4 lg:gap-2 text-sm font-light text-muted-foreground">
                <div>
                  <p className="font-normal text-foreground mb-1">{t("footer.visit_us")}</p>
                  <div className="space-y-0.5">
                    <p>{contactInfo.addressLine1}</p>
                    <p>{contactInfo.addressLine2}</p>
                  </div>
                </div>
                <div>
                  <p className="font-normal text-foreground mb-1">{t("footer.contact")}</p>
                  <div className="space-y-0.5">
                    <p>{contactInfo.phone}</p>
                    <p>{contactInfo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Link lists - Right side */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4 lg:gap-8">
              {/* Shop */}
              <div>
                <h4 className="text-sm font-normal mb-4 text-foreground">{t("footer.shop")}</h4>
                <ul className="space-y-2">
                  <li><a href="/category/new-in" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">{t("footer.new_arrivals")}</a></li>
                  <li><a href="/category/skincare" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">{t("footer.skincare")}</a></li>
                  <li><a href="/category/makeup" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">{t("footer.makeup")}</a></li>
                  <li><a href="/category/lips" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">{t("footer.lips")}</a></li>
                  <li><a href="/category/face" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">{t("footer.face")}</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-sm font-normal mb-4 text-foreground">About</h4>
                <ul className="space-y-2">
                  <li><a href="/about/our-story" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Our Story</a></li>
                  <li><a href="/about/sustainability" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Sustainability</a></li>
                  <li><a href="/about/shade-guide" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Shade Guide</a></li>
                  <li><a href="/about/customer-care" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Customer Care</a></li>
                  <li><a href="/about/store-locator" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Store Locator</a></li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="text-sm font-normal mb-4 text-foreground">{t("footer.connect")}</h4>
                <ul className="space-y-2">
                  <li><a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
                  <li><a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">TikTok</a></li>
                  <li><a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">Facebook</a></li>
                  <li><a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">WhatsApp</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - edge to edge separator */}
        <div className="border-t border-border -mx-6 px-6 pt-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm font-light text-muted-foreground mb-1 md:mb-0">
              © 2026 DAVALA. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="/privacy-policy" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.privacy")}
              </a>
              <a href="/terms-of-service" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.terms")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;