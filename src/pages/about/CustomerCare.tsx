import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import AboutSidebar from "../../components/about/AboutSidebar";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSettings } from "@/contexts/SettingsContext";

import { useLandingPageSections } from "@/hooks/useLandingPageSections";
import ParallaxSection from "../../components/ui/parallax-section";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerCare = () => {
  const { data: settings } = useSiteSettings();
  const { data: sections } = useLandingPageSections("customer-care");
  const { t, contactInfo } = useSettings();

  const getSetting = (key: string, defaultValue: string = "") =>
    settings?.find((s) => s.key === key)?.value || defaultValue;

  const getSection = (key: string) =>
    sections?.find(s => s.section_key === key);

  const header = getSection("header");

  const phone = getSetting("phone", contactInfo.phone);
  const email = getSetting("email", contactInfo.email);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>

        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader
            title={header?.title || t("care.title")}
            subtitle={header?.subtitle || t("care.subtitle")}
          />

          <ParallaxSection speed={0.05}>
            <div className="relative h-[60vh] mb-24 overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1600"
                alt="Luxury Customer Experience"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[3s]"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center space-y-4 px-6">
                  <h2 className="text-4xl md:text-6xl font-light text-white uppercase tracking-[0.3em]">{t("care.title")}</h2>
                  <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto italic">
                    "Experience personalized beauty curation with our dedicated experts."
                  </p>
                </div>
              </div>
            </div>
          </ParallaxSection>

          <ContentSection title="Our Promise">
            <div className="grid md:grid-cols-2 gap-16 mb-24">
              <div className="space-y-8">
                <h3 className="text-3xl font-light text-foreground uppercase tracking-widest leading-tight">{t("care.contact_info")}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  At DAVALA, your journey is our priority. Whether you seek guidance on our latest collections or require assistance with an existing ritual, our specialists are here to ensure your experience is nothing short of extraordinary.
                </p>
                <div className="w-20 h-0.5 bg-primary/40" />
                <p className="text-muted-foreground leading-relaxed">
                  We believe that luxury is in the details. Our concierge team is available to assist you with everything from shade matching to personalized skincare rituals, ensuring that your experience with DAVALA is as radiant as your results.
                </p>
              </div>
              <div className="grid gap-6">
                {[
                  { icon: <Phone className="w-6 h-6" />, label: "Concierge Phone", value: phone, desc: "Available Sat-Thu, 10am - 8pm" },
                  { icon: <Mail className="w-6 h-6" />, label: "Direct Email", value: email, desc: "Expected response within 2 hours" },
                  { icon: <MessageSquare className="w-6 h-6" />, label: "WhatsApp Specialist", value: "Consult with an expert", desc: "Real-time beauty advice" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-8 border border-border bg-card/50 hover:bg-card transition-all duration-500 group">
                    <div className="text-primary mt-1 transform group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-light text-foreground">{item.value}</p>
                      <p className="text-sm text-muted-foreground italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ContentSection>

          <ParallaxSection speed={0.08}>
            <ContentSection title={t("care.faq_title")}>
              <div className="space-y-12">
                {[
                  { q: t("care.faq.q1"), a: t("care.faq.a1") },
                  { q: t("care.faq.q2"), a: t("care.faq.a2") },
                  { q: t("care.faq.q3"), a: t("care.faq.a3") }
                ].map((faq, i) => (
                  <div key={i} className="space-y-4 group">
                    <h4 className="text-2xl font-light text-foreground tracking-wide group-hover:text-primary transition-colors cursor-default">
                      {faq.q}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed font-light pl-6 border-l border-primary/20 group-hover:border-primary transition-colors">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </ContentSection>
          </ParallaxSection>

          <div className="py-24 border-t border-border mt-12 text-center space-y-8">
            <h3 className="text-2xl font-light text-foreground uppercase tracking-[0.2em] italic">Visit Us In Person</h3>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">Discover our Experience Centers and our collection firsthand with a dedicated product specialist.</p>
            <div className="flex justify-center">
              <Button asChild variant="outline" className="rounded-none px-12 py-6 text-sm tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-700">
                <Link to="/about/store-locator">Explore Locations</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerCare;