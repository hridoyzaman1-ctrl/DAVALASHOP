import { Link } from "react-router-dom";
import { useLandingPageSections } from "@/hooks/useLandingPageSections";
import { useSettings } from "@/contexts/SettingsContext";
import { useActiveSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import SaleTimer from "@/components/ui/SaleTimer";
import skincareCollection from "@/assets/skincare-collection.jpg";
import makeupCollection from "@/assets/makeup-collection.jpg";

const FiftyFiftySection = () => {
  const { data: sections } = useLandingPageSections();
  const { t, language } = useSettings();
  const { data: sales } = useActiveSales();
  const { data: products } = useProducts();

  const leftSection = sections?.find(s => s.section_key === "fifty_fifty_left");
  const rightSection = sections?.find(s => s.section_key === "fifty_fifty_right");

  // Use database content or fallback to defaults with translations
  const leftImage = leftSection?.image_url || skincareCollection;
  const leftTitle = leftSection?.title || t("category.skincare_collection");
  const leftDescription = leftSection?.description || t("category.skincare_desc");
  const leftLink = leftSection?.cta_link || "/category/skincare";

  const rightImage = rightSection?.image_url || makeupCollection;
  const rightTitle = rightSection?.title || t("category.makeup_essentials");
  const rightDescription = rightSection?.description || t("category.makeup_desc");
  const rightLink = rightSection?.cta_link || "/category/makeup";

  // Check if categories have products on sale
  const getCategorySale = (categorySlug: string) => {
    if (!sales || !products) return null;

    // Find products in this category
    const categoryProducts = products.filter(p => {
      const productCategory = p.categories?.name?.toLowerCase().replace(/\s+/g, '-');
      return productCategory === categorySlug;
    });

    if (categoryProducts.length === 0) return null;

    // Check for sales that apply to this category
    for (const sale of sales) {
      // Global sales apply to all products
      if (sale.sale_type === 'global') {
        return {
          discountPercent: sale.discount_percent,
          endTime: sale.end_time
        };
      }

      // Category sales - check if target_id matches any product's category_id
      if (sale.sale_type === 'category') {
        const hasMatchingCategory = categoryProducts.some(p => p.category_id === sale.target_id);
        if (hasMatchingCategory) {
          return {
            discountPercent: sale.discount_percent,
            endTime: sale.end_time
          };
        }
      }

      // Product sales - check if any product in category is on sale
      if (sale.sale_type === 'product') {
        const hasMatchingProduct = categoryProducts.some(p => p.id === sale.target_id);
        if (hasMatchingProduct) {
          return {
            discountPercent: sale.discount_percent,
            endTime: sale.end_time
          };
        }
      }
    }

    return null;
  };

  const leftSale = getCategorySale('skincare');
  const rightSale = getCategorySale('makeup');

  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Link to={leftLink} className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden relative group">
              <img
                src={leftImage}
                alt={leftTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Sale Badge and Timer Overlay */}
              {leftSale && (
                <>
                  <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-semibold rounded-sm shadow-lg">
                    -{leftSale.discountPercent}% OFF
                  </div>
                  <div className="absolute bottom-0 left-0 right-0">
                    <SaleTimer endTime={leftSale.endTime} variant="card-overlay" />
                  </div>
                </>
              )}
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              {leftTitle}
            </h3>
            <p className="text-sm font-light text-foreground">
              {leftDescription}
            </p>
          </div>
        </div>

        <div>
          <Link to={rightLink} className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden relative group">
              <img
                src={rightImage}
                alt={rightTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Sale Badge and Timer Overlay */}
              {rightSale && (
                <>
                  <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-semibold rounded-sm shadow-lg">
                    -{rightSale.discountPercent}% OFF
                  </div>
                  <div className="absolute bottom-0 left-0 right-0">
                    <SaleTimer endTime={rightSale.endTime} variant="card-overlay" />
                  </div>
                </>
              )}
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              {rightTitle}
            </h3>
            <p className="text-sm font-light text-foreground">
              {rightDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiftyFiftySection;
