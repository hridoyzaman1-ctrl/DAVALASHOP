import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/contexts/SettingsContext";
import { Product } from "@/hooks/useProducts";
import WishlistButton from "@/components/product/WishlistButton";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { useActiveSales } from "@/hooks/useSales";
import { getEffectivePrice } from "@/lib/priceUtils";
import SaleTimer from "@/components/ui/SaleTimer";
import { Badge } from "@/components/ui/badge";

interface ProductGridProps {
  products: (Product & { categories: { name: string } | null })[];
  isLoading?: boolean;
}

const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  const { formatPrice, t, language } = useSettings();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { data: activeSales } = useActiveSales();

  if (isLoading) {
    return (
      <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="w-full px-6 mb-16">
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {t("product.no_products")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action={language === 'bn' ? 'ফেভারিটে যোগ করতে' : 'add to favorites'}
      />
      <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const { finalPrice, discountPercent, activeSale } = getEffectivePrice(
              product,
              activeSales || []
            );

            return (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card
                  className="border-none shadow-none bg-transparent group cursor-pointer"
                >
                  <CardContent className="p-0">
                    <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={language === 'bn' && product.name_bn ? product.name_bn : product.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/[0.03]"></div>

                      {/* Tags Container */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.is_new && (
                          <div className="px-2 py-1 text-xs font-medium text-white bg-primary rounded">
                            {t("product.new")}
                          </div>
                        )}
                        {/* Sale Badge */}
                        {activeSale && (
                          <div className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded animate-pulse">
                            SALE {Math.round(discountPercent)}%
                          </div>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <WishlistButton
                          productId={product.id}
                          onAuthRequired={() => setShowAuthPrompt(true)}
                        />
                      </div>

                      {/* Timer Overlay */}
                      {activeSale && activeSale.end_time && (
                        <SaleTimer endTime={activeSale.end_time} variant="card-overlay" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light text-muted-foreground">
                        {product.categories?.name || t("product.general")}
                      </p>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">
                          {language === 'bn' && product.name_bn ? product.name_bn : product.name}
                        </h3>
                        <div className="flex flex-col items-end">
                          {finalPrice < product.price ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-sm font-bold text-red-600">
                                {formatPrice(finalPrice)}
                              </span>
                            </>
                          ) : (
                            <p className="text-sm font-light text-foreground whitespace-nowrap ml-2">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const soldNum = (product.id.charCodeAt(0) % 190) + 10;
                          const bnNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
                          const numStr = language === 'bn'
                            ? soldNum.toString().split('').map(d => bnNumerals[parseInt(d)]).join('')
                            : soldNum.toString();
                          return `${numStr} ${language === 'bn' ? 'বিক্রি হয়েছে' : 'sold'}`;
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default ProductGrid;
