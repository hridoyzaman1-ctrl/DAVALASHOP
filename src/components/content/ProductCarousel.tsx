import { useState, useEffect, useRef, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useActiveSales } from "@/hooks/useSales";
import { getEffectivePrice } from "@/lib/priceUtils";
import SaleTimer from "@/components/ui/SaleTimer";

const AUTO_SCROLL_INTERVAL = 2000; // 2 seconds between auto-scrolls
const RESUME_DELAY = 5000; // 5 seconds after user interaction to resume

const ProductCarousel = () => {
  const { data: products, isLoading } = useProducts();
  const { t, formatPrice, language } = useSettings();
  const { data: activeSales } = useActiveSales();
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter to show new or featured products (up to 8)
  const displayProducts = products
    ?.filter(p => p.is_active)
    .slice(0, 8) || [];

  // Auto-scroll function
  const autoScroll = useCallback(() => {
    if (!api || isPaused) return;

    if (api.canScrollNext()) {
      api.scrollNext();
    } else {
      // Loop back to start
      api.scrollTo(0);
    }
  }, [api, isPaused]);

  // Start auto-scroll
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    autoScrollRef.current = setInterval(autoScroll, AUTO_SCROLL_INTERVAL);
  }, [autoScroll]);

  // Pause auto-scroll
  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    // Clear any existing resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    // Set timeout to resume after user interaction
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, RESUME_DELAY);
  }, []);

  // Handle user interaction
  const handleInteraction = useCallback(() => {
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  // Start auto-scroll when not paused
  useEffect(() => {
    if (!isPaused && api && displayProducts.length > 1) {
      startAutoScroll();
    }
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isPaused, api, displayProducts.length, startAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrentIndex(api.selectedScrollSnap());
    };

    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
      api.off("reInit", updateScrollState);
    };
  }, [api]);

  if (isLoading) {
    return (
      <section className="w-full mb-16 px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full mb-16 px-6 pt-12 md:pt-24">
      {/* Swipe indicators for navigation */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2 tracking-wide font-light">
            <ChevronLeft className="h-3 w-3" />
            {t("product.swipe_hint")}
            <ChevronRight className="h-3 w-3" />
          </p>
          {/* Auto-scroll indicator */}
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isPaused ? 'bg-muted-foreground/30' : 'bg-primary animate-pulse'}`} />
        </div>

        {/* Navigation arrows for desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => {
              api?.scrollPrev();
              handleInteraction();
            }}
            disabled={!canScrollPrev}
            className={`p-3 rounded-full border border-border transition-colors ${canScrollPrev
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed"
              }`}
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              api?.scrollNext();
              handleInteraction();
            }}
            disabled={!canScrollNext}
            className={`p-3 rounded-full border border-border transition-colors ${canScrollNext
              ? "hover:bg-muted text-foreground"
              : "text-muted-foreground/30 cursor-not-allowed"
              }`}
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
        onMouseEnter={handleInteraction}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleInteraction}
        onTouchEnd={() => {
          // Resume after touch with a delay
          resumeTimeoutRef.current = setTimeout(() => {
            setIsPaused(false);
          }, RESUME_DELAY);
        }}
      >
        <CarouselContent className="">
          {displayProducts.map((product) => {
            const { finalPrice, discountPercent, activeSale } = getEffectivePrice(
              product,
              activeSales || []
            );

            return (
              <CarouselItem
                key={product.id}
                className="basis-[65%] md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
              >
                <Link to={`/product/${product.id}`}>
                  <Card className="border-none shadow-none bg-transparent group">
                    <CardContent className="p-0">
                      <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={language === 'bn' && product.name_bn ? product.name_bn : product.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/[0.03]"></div>

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.is_new && (
                            <div className="px-2 py-1 text-xs font-medium text-white bg-primary rounded">
                              {t("product.new")}
                            </div>
                          )}
                          {activeSale && (
                            <div className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded animate-pulse">
                              SALE {Math.round(discountPercent)}%
                            </div>
                          )}
                        </div>

                        {/* Timer Overlay */}
                        {activeSale && activeSale.end_time && (
                          <SaleTimer endTime={activeSale.end_time} variant="card-overlay" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-light text-muted-foreground">
                          {product.categories?.name || t("product.skincare")}
                        </p>
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-foreground truncate pr-2">
                            {language === 'bn' && product.name_bn ? product.name_bn : product.name}
                          </h3>
                          {/* Price Display */}
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
                              <p className="text-sm font-light text-foreground whitespace-nowrap">
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
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Progress dots - Show current position */}
      <div className="flex items-center justify-center mt-6 gap-2">
        {displayProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              api?.scrollTo(index);
              handleInteraction();
            }}
            className={`transition-all duration-300 rounded-full ${index === currentIndex
              ? 'w-6 h-2 bg-primary'
              : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            aria-label={`Go to product ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;

