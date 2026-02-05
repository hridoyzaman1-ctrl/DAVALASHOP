import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useRef } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductReviews from "../components/product/ProductReviews";
import ProductCarousel from "../components/content/ProductCarousel";
import { useProduct } from "@/hooks/useProducts";
import { useSettings } from "@/contexts/SettingsContext";
import ProductWhatsAppBanner from "../components/product/ProductWhatsAppBanner";
import { Skeleton } from "@/components/ui/skeleton";
import CouponBanner from "@/components/layout/CouponBanner";
import { useActiveSales } from "@/hooks/useSales";
import { getEffectivePrice } from "@/lib/priceUtils";
import FloatingBuyButton from "../components/product/FloatingBuyButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { productId } = useParams();
  const { data: product, isLoading, error } = useProduct(productId || "");
  const { t, language } = useSettings();
  const productInfoRef = useRef<HTMLDivElement>(null);

  // Flash Sale Logic
  const { data: sales } = useActiveSales();
  const saleInfo = product ? getEffectivePrice(product, sales) : null;

  // Handler for floating buy button
  const handleFloatingBuyClick = () => {
    // First, trigger the Order Now button to expand the form
    const orderButton = document.querySelector('[data-order-now-button]') as HTMLButtonElement;
    orderButton?.click();

    // Then scroll to the quantity section after a short delay
    setTimeout(() => {
      const deliverySection = document.querySelector('[data-delivery-section]');
      if (deliverySection) {
        deliverySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback: scroll to ProductInfo section
        productInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-6 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-6 px-6 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-light text-foreground mb-4">
              {language === "bn" ? "পণ্য পাওয়া যায়নি" : "Product Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === "bn"
                ? "দুঃখিত, আপনি যে পণ্যটি খুঁজছেন তা পাওয়া যায়নি।"
                : "Sorry, the product you're looking for doesn't exist."}
            </p>
            <Link
              to="/category/shop"
              className="text-primary hover:underline"
            >
              {language === "bn" ? "শপিং চালিয়ে যান" : "Continue Shopping"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = product.categories?.name || (language === "bn" ? "স্কিনকেয়ার" : "Skincare");
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CouponBanner />

      <main className="pt-6">
        <section className="w-full px-6">
          {/* Breadcrumb - Show above image on smaller screens */}
          <div className="lg:hidden mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">{language === "bn" ? "হোম" : "Home"}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/category/${categorySlug}`}>{categoryName}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{language === "bn" && product.name_bn ? product.name_bn : product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-8 lg:h-fit space-y-8">
              <ProductImageGallery
                product={product}
                isSale={saleInfo?.isSale}
                discountPercent={saleInfo?.discountPercent}
                saleEnd={saleInfo?.saleEnd}
              />
              <ProductWhatsAppBanner />
            </div>

            <div ref={productInfoRef} className="lg:pl-8">
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Floating Buy Now Button */}
          <FloatingBuyButton
            onBuyNowClick={handleFloatingBuyClick}
            productId={product.id}
          />
        </section>

        {/* Reviews Section */}
        <section className="w-full px-6 mt-16 lg:mt-24 mb-16">
          <ProductReviews productId={product.id} />
        </section>



        <section className="w-full">
          <div className="mb-4 px-6">
            <h2 className="text-sm font-light text-foreground">
              {language === "bn" ? `আমাদের অন্যান্য ${categoryName}` : `Our other ${categoryName}`}
            </h2>
          </div>
          <ProductCarousel />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;