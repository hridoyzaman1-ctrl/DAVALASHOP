import { useState, useRef } from "react";
import ImageZoom from "./ImageZoom";
import { Product } from "@/hooks/useProducts";
import SaleTimer from "@/components/ui/SaleTimer";

interface ProductImageGalleryProps {
  product: Product;
  isSale?: boolean;
  discountPercent?: number;
  saleEnd?: string | null;
}

const ProductImageGallery = ({ product, isSale, discountPercent, saleEnd }: ProductImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Build images array from product data
  const productImages: string[] = [];

  // Add main image
  if (product.image_url) {
    productImages.push(product.image_url);
  }

  // Add gallery images
  if (product.gallery_urls && product.gallery_urls.length > 0) {
    productImages.push(...product.gallery_urls);
  }

  // Fallback if no images
  if (productImages.length === 0) {
    productImages.push("/placeholder.svg");
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleImageClick = (index: number) => {
    setZoomInitialIndex(index);
    setIsZoomOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const difference = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  return (
    <div className="w-full">
      {/* Desktop: Vertical scrolling gallery (1024px and above) */}
      <div className="hidden lg:block">
        <div className="space-y-4">
          {productImages.map((image, index) => (
            <div
              key={index}
              className="w-full aspect-square overflow-hidden cursor-pointer group bg-muted/10 relative"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError}
              />

              {/* Sale Overlay - Only on first image */}
              {index === 0 && isSale && (
                <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between pointer-events-none z-10">
                  {/* Discount Badge */}
                  {discountPercent && (
                    <div className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-sm font-medium text-sm shadow-lg">
                      -{discountPercent}% OFF
                    </div>
                  )}

                  {/* Countdown Timer */}
                  {saleEnd && (
                    <div className="ml-auto">
                      <SaleTimer endTime={saleEnd} variant="product" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tablet/Mobile: Image slider (below 1024px) */}
      <div className="lg:hidden">
        <div className="relative">
          <div
            className="w-full aspect-square overflow-hidden cursor-pointer group touch-pan-y bg-muted/10 relative"
            onClick={() => handleImageClick(currentImageIndex)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={productImages[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
              onError={handleImageError}
            />

            {/* Sale Overlay - Only on first image */}
            {currentImageIndex === 0 && isSale && (
              <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between pointer-events-none z-10">
                {/* Discount Badge */}
                {discountPercent && (
                  <div className="bg-destructive text-destructive-foreground px-2.5 py-1 rounded-sm font-medium text-xs shadow-lg">
                    -{discountPercent}% OFF
                  </div>
                )}

                {/* Countdown Timer */}
                {saleEnd && (
                  <div className="ml-auto">
                    <SaleTimer endTime={saleEnd} variant="product" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dots indicator */}
          {productImages.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-foreground' : 'bg-muted'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoom
        images={productImages}
        initialIndex={zoomInitialIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};

export default ProductImageGallery;