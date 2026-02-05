import { useState } from "react";
import { Link } from "react-router-dom";
import ProductPaymentMethods from "./ProductPaymentMethods";
import QuickOrderForm from "./QuickOrderForm";
import WhatsAppContact from "../checkout/WhatsAppContact";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Minus, Plus, Truck, Check, Star, ChevronDown, ChevronUp } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useReviews";
import { useActiveSales } from "@/hooks/useSales";
import { getEffectivePrice } from "@/lib/priceUtils";
import SaleTimer from "@/components/ui/SaleTimer";

interface ProductInfoProps {
  product: Product & { categories: { name: string } | null; name_bn?: string | null };
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

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState("dhaka");
  const [isAdding, setIsAdding] = useState(false);
  const { t, language, formatPrice, deliveryDhakaPrice, deliveryOutsideDhakaPrice, formatNumber } = useSettings();
  const { addItem } = useCart();
  const { data: reviews } = useProductReviews(product.id);
  const { toast } = useToast();

  // Flash Sale Logic
  const { data: sales } = useActiveSales();
  const { finalPrice, originalPrice, discountPercent, isSale, saleEnd } = getEffectivePrice(product, sales);


  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";
  const reviewCount = reviews?.length || 0;
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const categoryName = product.categories?.name || (language === "bn" ? "স্কিনকেয়ার" : "Skincare");
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

  const displayName = language === "bn" && product.name_bn ? product.name_bn : product.name;

  const handleAddToCart = async () => {
    setIsAdding(true);

    let success = true;
    for (let i = 0; i < quantity; i++) {
      const result = await addItem({
        id: product.id,
        name: product.name,
        nameBn: product.name_bn || undefined,
        price: finalPrice, // Use Sale Price
        image: product.image_url || '/placeholder.svg',
        categoryId: product.category_id || undefined,
        categoryName: product.categories?.name || undefined,
      });
      if (!result) {
        success = false;
        break;
      }
    }

    if (success) {
      toast({
        title: language === "bn" ? "কার্টে যোগ হয়েছে" : "Added to Cart",
        description: language === "bn"
          ? `${displayName} (${quantity}টি) আপনার কার্টে যোগ হয়েছে`
          : `${displayName} (${quantity}) has been added to your cart`,
      });
    }

    setTimeout(() => setIsAdding(false), 1000);
    setQuantity(1);
  };

  return (
    <div className="space-y-6 relative">
      {/* Breadcrumb - Show only on desktop */}
      <div className="hidden lg:block">
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
              <BreadcrumbPage>{displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Product title and price */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-light text-muted-foreground mb-1">{categoryName}</p>
            <h1 className="text-2xl md:text-3xl font-light text-foreground">{displayName}</h1>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end">
              {isSale ? (
                <>
                  <span className="text-xl font-medium text-destructive">{formatPrice(finalPrice)}</span>
                  <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(originalPrice)}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {saleEnd && <SaleTimer endTime={saleEnd} variant="product" />}
                    <span className="text-xs text-destructive font-medium bg-destructive/10 px-1.5 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xl font-light text-foreground">{formatPrice(product.price)}</p>
              )}
            </div>

            {product.compare_at_price && product.compare_at_price > originalPrice && !isSale && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </p>
            )}
          </div>
        </div>

        {/* Read-only Rating Summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <CustomStar
                key={star}
                filled={star <= Math.round(parseFloat(averageRating))}
              />
            ))}
            <span className="text-sm font-light text-muted-foreground ml-1">{formatNumber(parseFloat(averageRating))}</span>
          </div>
          {reviewCount > 0 && (
            <span className="text-xs text-muted-foreground font-light">
              ({language === 'bn' ? `${formatNumber(reviewCount)}টি রিভিউ` : `${reviewCount} reviews`})
            </span>
          )}
        </div>

        {/* Integrated Description and Details from ProductDescription.tsx */}
        <div className="space-y-0 border-t border-border">
          {product.description && (
            <div className="border-b border-border">
              <Button
                variant="ghost"
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full h-12 px-0 justify-between hover:bg-transparent font-light rounded-none"
              >
                <span className="text-sm">{language === "bn" ? "বিবরণ" : "Description"}</span>
                {isDescriptionOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {isDescriptionOpen && (
                <div className="pb-4">
                  <p className="text-sm font-light text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-b border-border">
            <Button
              variant="ghost"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full h-12 px-0 justify-between hover:bg-transparent font-light rounded-none"
            >
              <span className="text-sm">{language === "bn" ? "পণ্যের বিবরণ" : "Product Details"}</span>
              {isDetailsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {isDetailsOpen && (
              <div className="pb-4 space-y-2">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div data-delivery-section className="space-y-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-light text-foreground">
            {language === "bn" ? "ডেলিভারি অপশন" : "Delivery Option"}
          </h3>
        </div>

        <RadioGroup
          value={deliveryOption}
          onValueChange={setDeliveryOption}
          className="space-y-2"
        >
          <div className="flex items-center justify-between p-3 border border-border rounded-sm">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="dhaka" id="dhaka-product" />
              <Label htmlFor="dhaka-product" className="font-light text-sm text-foreground cursor-pointer">
                {language === "bn" ? "ঢাকার ভিতরে" : "Inside Dhaka"}
              </Label>
            </div>
            <span className="text-sm text-muted-foreground">৳{deliveryDhakaPrice}</span>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-sm">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="outside" id="outside-product" />
              <Label htmlFor="outside-product" className="font-light text-sm text-foreground cursor-pointer">
                {language === "bn" ? "ঢাকার বাইরে" : "Outside Dhaka"}
              </Label>
            </div>
            <span className="text-sm text-muted-foreground">৳{deliveryOutsideDhakaPrice}</span>
          </div>
        </RadioGroup>
      </div>

      {/* Quick Order Form - PRIORITY */}
      <QuickOrderForm product={product} />

      {/* Or Add to Cart for later */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>{language === "bn" ? "অথবা" : "OR"}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">
            {language === "bn" ? "পরিমাণ" : "Quantity"}
          </span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full h-12 bg-primary/10 border border-primary/20 text-foreground hover:bg-primary/20 font-medium rounded-none transition-all duration-300"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {language === "bn" ? "যোগ হয়েছে!" : "Added!"}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {language === "bn" ? "কার্টে যোগ করুন" : "Add to Cart"}
              <span className="text-xs text-muted-foreground font-light">
                ({language === "bn" ? "পরে অর্ডার করুন" : "Order Later"})
              </span>
            </span>
          )}
        </Button>

        {/* Stock info */}
        {product.stock_quantity !== null && product.stock_quantity <= 10 && product.stock_quantity > 0 && (
          <p className="text-sm text-primary text-center">
            {language === "bn"
              ? `মাত্র ${product.stock_quantity}টি বাকি আছে!`
              : `Only ${product.stock_quantity} left in stock!`}
          </p>
        )}
      </div>

      {/* Payment Methods */}
      <ProductPaymentMethods />
    </div>
  );
};

export default ProductInfo;
