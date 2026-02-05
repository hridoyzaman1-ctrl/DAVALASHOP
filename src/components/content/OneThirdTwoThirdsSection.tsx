import { Link } from "react-router-dom";
import { useLandingPageSections } from "@/hooks/useLandingPageSections";
import serumProduct from "@/assets/serum-product.jpg";
import davalaPromo from "@/assets/davala_promo_v2.png";

const OneThirdTwoThirdsSection = () => {
  const { data: sections } = useLandingPageSections();

  const oneThirdSection = sections?.find(s => s.section_key === "one_third");
  const twoThirdsSection = sections?.find(s => s.section_key === "two_thirds");

  const oneThirdImage = oneThirdSection?.image_url || serumProduct;
  const oneThirdTitle = oneThirdSection?.title || "New Arrivals";
  const oneThirdDescription = oneThirdSection?.description || "Discover our latest additions";
  const oneThirdLink = oneThirdSection?.cta_link || "/category/new-arrivals";

  // Replaced creamProduct with davalaPromo as requested
  const twoThirdsImage = twoThirdsSection?.image_url || davalaPromo;
  const twoThirdsTitle = twoThirdsSection?.title || "Best Selling";
  const twoThirdsDescription = twoThirdsSection?.description || "Our most loved products";
  const twoThirdsLink = twoThirdsSection?.cta_link || "/category/best-selling";

  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Link to={oneThirdLink} className="block">
            <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
              <img
                src={oneThirdImage}
                alt={oneThirdTitle}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              {oneThirdTitle}
            </h3>
            <p className="text-sm font-light text-foreground">
              {oneThirdDescription}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Link to={twoThirdsLink} className="block">
            <div className="w-full h-[500px] lg:h-[800px] mb-3 overflow-hidden">
              <img
                src={twoThirdsImage}
                alt={twoThirdsTitle}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              {twoThirdsTitle}
            </h3>
            <p className="text-sm font-light text-foreground">
              {twoThirdsDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OneThirdTwoThirdsSection;
