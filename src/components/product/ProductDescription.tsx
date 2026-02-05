import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { Product } from "@/hooks/useProducts";


interface ProductDescriptionProps {
  product: Product;
}

const CustomStar = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-3 h-3 ${filled ? 'text-foreground' : 'text-muted-foreground/30'} ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const { language } = useSettings();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      {/* Description */}
      {product.description && (
        <div className="border-b border-border">
          <Button
            variant="ghost"
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
          >
            <span>{language === "bn" ? "বিবরণ" : "Description"}</span>
            {isDescriptionOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {isDescriptionOpen && (
            <div className="pb-6 space-y-4">
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Product Details */}
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>{language === "bn" ? "পণ্যের বিবরণ" : "Product Details"}</span>
          {isDetailsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isDetailsOpen && (
          <div className="pb-6 space-y-3">
            {product.sku && (
              <div className="flex justify-between">
                <span className="text-sm font-light text-muted-foreground">
                  {language === "bn" ? "SKU" : "SKU"}
                </span>
                <span className="text-sm font-light text-foreground">{product.sku}</span>
              </div>
            )}
            {product.volume_size && (
              <div className="flex justify-between">
                <span className="text-sm font-light text-muted-foreground">
                  {language === "bn" ? "আকার" : "Size"}
                </span>
                <span className="text-sm font-light text-foreground">{product.volume_size}</span>
              </div>
            )}
            {product.skin_type && (
              <div className="flex justify-between">
                <span className="text-sm font-light text-muted-foreground">
                  {language === "bn" ? "ত্বকের ধরন" : "Skin Type"}
                </span>
                <span className="text-sm font-light text-foreground">{product.skin_type}</span>
              </div>
            )}
            {product.finish_type && (
              <div className="flex justify-between">
                <span className="text-sm font-light text-muted-foreground">
                  {language === "bn" ? "ফিনিশ" : "Finish"}
                </span>
                <span className="text-sm font-light text-foreground">{product.finish_type}</span>
              </div>
            )}
            {product.coverage && (
              <div className="flex justify-between">
                <span className="text-sm font-light text-muted-foreground">
                  {language === "bn" ? "কভারেজ" : "Coverage"}
                </span>
                <span className="text-sm font-light text-foreground">{product.coverage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How to Use */}
      {product.how_to_use && (
        <div className="border-b border-border">
          <Button
            variant="ghost"
            onClick={() => setIsHowToUseOpen(!isHowToUseOpen)}
            className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
          >
            <span>{language === "bn" ? "ব্যবহারের নিয়ম" : "How to Use"}</span>
            {isHowToUseOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {isHowToUseOpen && (
            <div className="pb-6 space-y-4">
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {product.how_to_use}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ingredients */}
      {product.ingredients && (
        <div className="border-b border-border">
          <Button
            variant="ghost"
            onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
            className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
          >
            <span>{language === "bn" ? "উপাদান" : "Ingredients"}</span>
            {isIngredientsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {isIngredientsOpen && (
            <div className="pb-6 space-y-4">
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer Reviews */}
      <div className="border-b border-border lg:mb-16">
        <Button
          variant="ghost"
          onClick={() => setIsReviewsOpen(!isReviewsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <div className="flex items-center gap-3">
            <span>{language === "bn" ? "গ্রাহক মতামত" : "Customer Reviews"}</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <CustomStar
                  key={star}
                  filled={star <= 4.5}
                />
              ))}
              <span className="text-sm font-light text-muted-foreground ml-1">4.5</span>
            </div>
          </div>
          {isReviewsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isReviewsOpen && (
          <div className="pb-6 space-y-6">
            {/* Review Product Button */}


            {/* Reviews List */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar
                        key={star}
                        filled={true}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-light text-muted-foreground">Fatima R.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {language === "bn"
                    ? '"অসাধারণ পণ্য! আমার ত্বকে খুব ভালো কাজ করেছে। নিয়মিত ব্যবহারে দারুণ ফলাফল পেয়েছি।"'
                    : '"Amazing product! Works really well on my skin. Got great results with regular use."'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar
                        key={star}
                        filled={star <= 4}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-light text-muted-foreground">Nusrat A.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {language === "bn"
                    ? '"দারুণ কোয়ালিটি এবং দাম অনুযায়ী চমৎকার। ডেলিভারিও দ্রুত ছিল।"'
                    : '"Great quality and excellent value for money. Delivery was also fast."'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <CustomStar
                        key={star}
                        filled={true}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-light text-muted-foreground">Tasnim K.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {language === "bn"
                    ? '"প্যাকেজিং সুন্দর ছিল এবং প্রোডাক্ট একদম অরিজিনাল। আবারও অর্ডার করব।"'
                    : '"Beautiful packaging and the product is completely original. Will order again."'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;