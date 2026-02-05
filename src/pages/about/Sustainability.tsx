import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import AboutSidebar from "../../components/about/AboutSidebar";
import { useSettings } from "@/contexts/SettingsContext";
import ParallaxSection from "../../components/ui/parallax-section";
import { Heart, Leaf, ShieldCheck, Zap } from "lucide-react";

import { useLandingPageSections } from "@/hooks/useLandingPageSections";

const Sustainability = () => {
  const { data: sections } = useLandingPageSections("sustainability");
  const { t } = useSettings();

  const getSection = (key: string) =>
    sections?.find(s => s.section_key === key);

  const header = getSection("header");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>

        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader
            title={header?.title || t("sustain.title")}
            subtitle={header?.subtitle || t("sustain.subtitle")}
          />

          <ParallaxSection speed={0.03} fadeIn>
            <div className="relative h-[70vh] mb-32 overflow-hidden group">
              <img
                src="https://images.pexels.com/photos/3616764/pexels-photo-3616764.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Davala Botanical Essence"
                className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-[4s] ease-out"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <span className="text-white/60 text-xs uppercase tracking-[0.5em] mb-6 animate-fade-in">Our Conscious Journey</span>
                <h2 className="text-5xl md:text-7xl font-light text-white uppercase tracking-[0.3em] leading-tight mb-8">
                  Pure. Ethical. <br />
                  <span className="italic font-extralight">Timeless.</span>
                </h2>
                <div className="w-px h-24 bg-white/30" />
              </div>
            </div>
          </ParallaxSection>

          <ContentSection title={t("sustain.clean_beauty")}>
            <div className="grid md:grid-cols-2 gap-24 mb-32 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-3xl font-light text-foreground uppercase tracking-widest">{t("sustain.eco_title")}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-8">
                    {t("sustain.eco_desc")}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-light text-foreground uppercase tracking-widest">{t("sustain.cruelty_title")}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-8">
                    {t("sustain.cruelty_desc")}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/10 rounded-full animate-pulse" />
                <div className="bg-primary/5 p-16 rounded-full aspect-square flex flex-col items-center justify-center text-center space-y-4">
                  <div className="text-6xl font-extralight text-primary">100%</div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Certified Clean Beauty</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 mb-32 relative overflow-hidden p-12 bg-muted/5 border border-border">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="text-center space-y-4">
                <div className="text-5xl font-extralight text-primary">Zero</div>
                <p className="text-sm font-light text-muted-foreground uppercase tracking-widest">Synthetic Fragrances</p>
              </div>
              <div className="text-center space-y-4 border-x border-border">
                <div className="text-5xl font-extralight text-primary">90%</div>
                <p className="text-sm font-light text-muted-foreground uppercase tracking-widest">Botanical Extracts</p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-5xl font-extralight text-primary">Eco</div>
                <p className="text-sm font-light text-muted-foreground uppercase tracking-widest">Responsible Packaging</p>
              </div>
            </div>
          </ContentSection>

          <ParallaxSection speed={0.06}>
            <ContentSection title={t("sustain.certifications")}>
              <div className="space-y-20">
                <p className="text-2xl text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light italic">
                  "We vet our brands against international standards to ensure you're getting the most ethical products available."
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { name: "PETA Cruelty-Free", color: "from-rose-50 to-white", icon: <Heart className="w-10 h-10 text-rose-300" /> },
                    { name: "Leaping Bunny", color: "from-blue-50 to-white", icon: <Zap className="w-10 h-10 text-blue-300" /> },
                    { name: "EWG Verified", color: "from-emerald-50 to-white", icon: <Leaf className="w-10 h-10 text-emerald-300" /> },
                    { name: "EcoCert", color: "from-amber-50 to-white", icon: <ShieldCheck className="w-10 h-10 text-amber-300" /> }
                  ].map((cert, i) => (
                    <div key={i} className="group relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl`} />
                      <div className="relative p-12 border border-border bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-8 h-full hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-2xl">
                        <div className="p-6 rounded-full bg-muted/10 transform group-hover:rotate-[360deg] transition-transform duration-[1.5s] ease-in-out">
                          {cert.icon}
                        </div>
                        <div className="space-y-2">
                          <span className="block text-sm font-medium uppercase tracking-widest text-foreground">{cert.name}</span>
                          <div className="w-8 h-px bg-primary/30 mx-auto group-hover:w-full transition-all duration-700" />
                        </div>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed">International Standard for Ethical & Clean Beauty</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ContentSection>
          </ParallaxSection>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Sustainability;