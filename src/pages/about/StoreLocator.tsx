import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import StoreMap from "../../components/about/StoreMap";
import { Button } from "../../components/ui/button";
import AboutSidebar from "../../components/about/AboutSidebar";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSettings } from "@/contexts/SettingsContext";

import { useLandingPageSections } from "@/hooks/useLandingPageSections";
import ParallaxSection from "../../components/ui/parallax-section";
import { MapPin, Phone } from "lucide-react";

const StoreLocator = () => {
  const { data: settings } = useSiteSettings();
  const { data: sections } = useLandingPageSections("store-locator");
  const { contactInfo, t } = useSettings();

  const getSetting = (key: string, defaultValue: string = "") =>
    settings?.find((s) => s.key === key)?.value || defaultValue;

  const getSection = (key: string) =>
    sections?.find(s => s.section_key === key);

  const header = getSection("header");

  const showMap = getSetting("show_store_map", "true") === "true";
  const mapUrl = getSetting("store_map_url", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14605.908354747752!2d90.41961621738281!3d23.7660233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c786a9d9a049%3A0x6b772c72b2605f6e!2sMerul%20Badda%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000");

  const stores = [
    {
      name: "DAVALA - EXPERIENCE CENTER",
      location: "Merul Badda, Dhaka",
      address: `${contactInfo.addressLine1}, ${contactInfo.addressLine2}`,
      phone: contactInfo.phone,
      services: ["Product Showcasing", "Shade Mapping", "Luxury Gifting", "Order Pickup"],
      image: "https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>

        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader
            title={header?.title || "Our Presence"}
            subtitle={header?.subtitle || "Experience the DAVALA ritual in person."}
          />

          <ParallaxSection speed={0.05}>
            <div className="relative h-[65vh] mb-24 overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Davala Luxury Showroom"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center space-y-4 px-6">
                  <h2 className="text-4xl md:text-6xl font-extralight text-white uppercase tracking-[0.5em] leading-tight">Brand Experience Centers</h2>
                  <p className="text-white/70 text-lg uppercase tracking-widest italic font-light">The Height of Cosmetic Excellence</p>
                </div>
              </div>
            </div>
          </ParallaxSection>

          <ContentSection title="Authorized Retails">
            <div className="grid gap-24">
              {stores.map((store, index) => (
                <div key={index} className="group grid lg:grid-cols-2 gap-12 items-center">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
                    />
                    <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-foreground font-medium">{store.location}</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-light text-foreground uppercase tracking-widest leading-tight">{store.name}</h3>
                      <div className="w-16 h-0.5 bg-primary/40" />
                    </div>

                    <div className="space-y-6 text-muted-foreground font-light">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <p className="text-lg leading-relaxed">{store.address}</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <Phone className="w-5 h-5 text-primary mt-1" />
                        <div className="space-y-1">
                          <p className="text-lg">{store.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-xs uppercase tracking-[0.3em] text-foreground font-medium">{t("locator.services")}</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        {store.services.map((service, serviceIndex) => (
                          <li key={serviceIndex} className="text-sm text-muted-foreground flex items-center group/item hover:text-foreground transition-colors cursor-default">
                            <div className="w-2 h-2 bg-primary/20 rounded-full mr-4 group-hover/item:bg-primary transition-colors" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button variant="outline" className="rounded-none px-10 py-6 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors duration-500">
                      {t("locator.directions")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ContentSection>

          {showMap && (
            <ParallaxSection speed={0.03}>
              <ContentSection title={t("locator.map_title")}>
                <div className="relative p-1 bg-muted border border-border">
                  <StoreMap mapUrl={mapUrl} stores={stores} />
                </div>
              </ContentSection>
            </ParallaxSection>
          )}

          <ContentSection title="Digital Beauty Concierge">
            <div className="grid md:grid-cols-2 gap-24 items-center py-16 border-y border-border/40">
              <div className="space-y-12">
                <h3 className="text-4xl font-extralight text-foreground uppercase tracking-widest leading-tight">Tailored Performance</h3>
                <p className="text-xl font-light text-muted-foreground italic leading-relaxed">
                  "Consult with our digital experts for a personalized skincare ritual designed for your unique profile."
                </p>
                <div className="grid gap-10">
                  {[
                    { title: "Digital skin assessment", desc: "Scientific approach to selecting the right actives for your skin health." },
                    { title: "Shade mapping", desc: "Our specialists find your perfect match from our extensive palette." },
                    { title: "Concierge Service", desc: "Exclusive early access to new collections and personalized curation." }
                  ].map((item, i) => (
                    <div key={i} className="group space-y-3 border-l border-primary/10 pl-8 hover:border-primary transition-all duration-500">
                      <h4 className="text-xs uppercase tracking-[0.3em] text-foreground font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square shadow-2xl border-4 border-muted/20">
                <img
                  src="https://images.pexels.com/photos/3373737/pexels-photo-3373737.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Davala Curated Display"
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-[2s]"
                />
              </div>
            </div>
          </ContentSection>

          <div className="mb-32 p-24 bg-muted/5 border border-border text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <h3 className="text-3xl font-light text-foreground uppercase tracking-[0.4em]">Davala worldwide</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light text-lg">
              Even as an online-first e-commerce, our commitment to excellence transcends digital boundaries. Experience our premium rituals through exclusive authorized partners.
            </p>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default StoreLocator;