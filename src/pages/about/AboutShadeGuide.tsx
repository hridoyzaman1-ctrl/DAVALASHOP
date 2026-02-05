import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import AboutSidebar from "../../components/about/AboutSidebar";
import { useSettings } from "@/contexts/SettingsContext";
import ParallaxSection from "../../components/ui/parallax-section";

import { useLandingPageSections } from "@/hooks/useLandingPageSections";
import { useIsMobile } from "@/hooks/use-mobile";

const AboutShadeGuide = () => {
  const { data: sections } = useLandingPageSections("shade-guide");
  const { t } = useSettings();
  const isMobile = useIsMobile();

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
            title={header?.title || t("shade.title")}
            subtitle={header?.subtitle || t("shade.subtitle")}
          />

          <ParallaxSection speed={isMobile ? 0 : 0.05} fadeIn={!isMobile}>
            <ContentSection title={t("shade.undertone_title")}>
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  { title: t("shade.cool_title"), desc: t("shade.cool_desc"), accent: "bg-blue-100" },
                  { title: t("shade.warm_title"), desc: t("shade.warm_desc"), accent: "bg-orange-100" },
                  { title: t("shade.neutral_title"), desc: t("shade.neutral_desc"), accent: "bg-stone-200" }
                ].map((item, i) => (
                  <div key={i} className="group p-8 border border-border bg-card/50 hover:bg-card transition-all duration-500 hover:shadow-2xl relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${item.accent} opacity-20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`} />
                    <h4 className="text-xl font-light text-foreground mb-4 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-32 py-12">
                {[
                  {
                    tone: "Fair",
                    range: "100 - 150",
                    match: "Porcelain, Ivory, Alabaster",
                    hex: "#F8F1E9",
                    image: "https://images.pexels.com/photos/3762465/pexels-photo-3762465.jpeg?auto=compress&cs=tinysrgb&w=800",
                    desc: "Radiant porcelain skins with delicate pink or neutral undertones."
                  },
                  {
                    tone: "Light",
                    range: "160 - 210",
                    match: "Vanilla, Cream, Beige",
                    hex: "#F1E1D1",
                    image: "https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg?auto=compress&cs=tinysrgb&w=800",
                    desc: "Creamy complexions that transition from soft ivory to golden beige."
                  },
                  {
                    tone: "Medium",
                    range: "220 - 280",
                    match: "Sand, Honey, Golden",
                    hex: "#E5C3A3",
                    image: "https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=800",
                    desc: "Sun-kissed olive and honey tones with a natural warmth."
                  },
                  {
                    tone: "Tan",
                    range: "290 - 350",
                    match: "Amber, Toffee, Caramel",
                    hex: "#C69061",
                    image: "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=800",
                    desc: "Rich, deep golden and bronzed complexions with vibrant depth."
                  },
                  {
                    tone: "Deep",
                    range: "360 - 450",
                    match: "Mocha, Cocoa, Chestnut",
                    hex: "#7B4B31",
                    image: "https://images.pexels.com/photos/2811088/pexels-photo-2811088.jpeg?auto=compress&cs=tinysrgb&w=800",
                    desc: "The richest ebony and mahogany depths with a brilliant radiance."
                  }
                ].map((item, index) => (
                  <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-16 items-center`}>
                    <div className="w-full md:w-1/2 relative group">
                      <div className="absolute inset-0 border border-primary/20 -m-4 transition-all duration-500 group-hover:m-0" />
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={item.image}
                          alt={`${item.tone} Skin Tone`}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-tighter text-muted-foreground font-medium">Complexion Range</span>
                        <h3 className="text-5xl font-light text-foreground">{item.tone}</h3>
                      </div>

                      <div className="flex items-center gap-8 p-10 border border-border bg-card shadow-sm">
                        <div
                          className="w-24 h-24 rounded-full border-4 border-background shadow-xl"
                          style={{ backgroundColor: item.hex }}
                        />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Master Swatch</p>
                          <p className="text-xl font-medium font-mono">{item.hex}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-12 py-8 border-y border-border">
                        <div className="space-y-1">
                          <p className="text-xs uppercase text-muted-foreground">Digital ID</p>
                          <p className="text-xl font-light">{item.range}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs uppercase text-muted-foreground">Signature Matches</p>
                          <p className="text-xl font-light">{item.match.split(',')[0]}</p>
                        </div>
                      </div>

                      <p className="text-xl text-muted-foreground leading-relaxed font-light italic">
                        "{item.desc}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          </ParallaxSection>

          <ParallaxSection speed={isMobile ? 0 : 0.08} fadeIn={!isMobile}>
            <ContentSection title={t("shade.lips_eyes")}>
              <div className="grid md:grid-cols-2 gap-24">
                <div className="space-y-12">
                  <h3 className="text-3xl font-light text-foreground uppercase tracking-widest border-b border-border pb-6">{t("shade.lipstick_finishes")}</h3>
                  <div className="space-y-12">
                    {[
                      { name: "Matte", desc: "Velvety, full coverage with no shine.", hex: "#9B302F" },
                      { name: "Satin", desc: "Creamy, semi-matte and hydrating.", hex: "#BD5B5A" },
                      { name: "Glossy", desc: "High shine with deep moisture.", hex: "#E58A89" }
                    ].map((finish, i) => (
                      <div key={i} className="flex gap-8 group">
                        <div className="w-20 h-20 rounded-none transform rotate-45 border border-border group-hover:rotate-90 transition-transform duration-700 overflow-hidden shrink-0">
                          <div className="w-full h-full -rotate-45" style={{ backgroundColor: finish.hex }} />
                        </div>
                        <div className="space-y-2">
                          <span className="block text-2xl font-light text-foreground">{finish.name}</span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{finish.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-light text-foreground uppercase tracking-widest border-b border-border pb-6">{t("shade.eye_textures")}</h3>
                  <div className="space-y-12">
                    {[
                      { name: "Velvet Matte", desc: "Smooth, blendable soft-focus finish.", hex: "#4A3728" },
                      { name: "Shimmer", desc: "Luminous, light-reflective pearls.", hex: "#8E735B" },
                      { name: "Metallic", desc: "High-impact foil effect pigments.", hex: "#C5A37B" }
                    ].map((texture, i) => (
                      <div key={i} className="flex gap-8 group">
                        <div className="w-20 h-20 rounded-full border border-border group-hover:scale-110 transition-transform duration-700 overflow-hidden shrink-0 shadow-inner">
                          <div className="w-full h-full opacity-80" style={{
                            background: `radial-gradient(circle, ${texture.hex} 0%, #000 150%)`,
                          }} />
                        </div>
                        <div className="space-y-2">
                          <span className="block text-2xl font-light text-foreground">{texture.name}</span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{texture.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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

export default AboutShadeGuide;