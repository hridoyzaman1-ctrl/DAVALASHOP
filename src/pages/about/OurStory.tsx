import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import ImageTextBlock from "../../components/about/ImageTextBlock";
import AboutSidebar from "../../components/about/AboutSidebar";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSettings } from "@/contexts/SettingsContext";
import davalaPromo from "../../assets/davala_promo_v2.png";

import { useLandingPageSections } from "@/hooks/useLandingPageSections";

const OurStory = () => {
  const { data: settings } = useSiteSettings();
  const { data: sections } = useLandingPageSections("our-story");
  const { t } = useSettings();

  const getSetting = (key: string, defaultValue: string = "") =>
    settings?.find((s) => s.key === key)?.value || defaultValue;

  const getSection = (key: string) =>
    sections?.find(s => s.section_key === key);

  const header = getSection("header");
  const mission = getSection("mission");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>

        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader
            title={header?.title || t("our_story.title")}
            subtitle={header?.subtitle || t("our_story.subtitle")}
          />

          <ContentSection>
            <ImageTextBlock
              image={header?.image_url || "/skincare-collection.jpg"}
              imageAlt="DAVALA Excellence"
              title={header?.description || t("our_story.content_title")}
              content={header?.subtitle ? header.description : t("our_story.content")}
              imagePosition="left"
            />
          </ContentSection>

          <ContentSection title={mission?.title || t("our_story.choose_us")}>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">{mission?.subtitle || t("our_story.authentic_title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {mission?.description || t("our_story.authentic_desc")}
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">{t("our_story.curated_title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("our_story.curated_desc")}
                </p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title={t("our_story.values_title")}>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">{t("our_story.authenticity")}</h3>
                <p className="text-muted-foreground">
                  {t("our_story.authenticity_desc")}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">{t("our_story.accessibility")}</h3>
                <p className="text-muted-foreground">
                  {t("our_story.accessibility_desc")}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">{t("our_story.care")}</h3>
                <p className="text-muted-foreground">
                  {t("our_story.care_desc")}
                </p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title={t("footer.visit_us")}>
            <div className="grid md:grid-cols-2 gap-8 items-center bg-muted/30 p-8 rounded-lg">
              <div>
                <p className="text-muted-foreground mb-4">
                  <strong className="text-foreground">{t("checkout.address")}:</strong><br />
                  {getSetting("address_line1", "Gulshan-2, Dhaka")}<br />
                  {getSetting("address_line2", "Dhaka, Bangladesh")}
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong className="text-foreground">{t("checkout.phone")}:</strong> {getSetting("phone", "01759772325")}
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">{t("checkout.email")}:</strong> {getSetting("email", "hello@davala.me")}
                </p>
              </div>
              <div className="rounded-lg overflow-hidden h-64 md:h-full min-h-[250px]">
                <img
                  src={davalaPromo}
                  alt="Davala Models"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </ContentSection>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default OurStory;
