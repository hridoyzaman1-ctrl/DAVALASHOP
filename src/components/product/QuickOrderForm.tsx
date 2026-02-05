import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Check, Truck, ShoppingBag, LogIn, Smartphone, Building2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/hooks/useProducts";
import { validateCoupon, Coupon } from "@/hooks/useCoupons";
import { useActiveSales } from "@/hooks/useSales";
import { getEffectivePrice } from "@/lib/priceUtils";

interface QuickOrderFormProps {
    product: Product & { categories: { name: string } | null; name_bn?: string | null };
}

const QuickOrderForm = ({ product }: QuickOrderFormProps) => {
    const navigate = useNavigate();
    const { t, language, formatPrice, deliveryDhakaPrice, deliveryOutsideDhakaPrice, paymentSettings, contactInfo } = useSettings();
    const { user, loading: authLoading } = useAuth();
    const { data: profile } = useProfile();
    const createOrder = useCreateOrder();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [deliveryOption, setDeliveryOption] = useState<"dhaka" | "outside_dhaka">("dhaka");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cod");

    // Prefill form from profile
    useEffect(() => {
        if (profile) {
            setCustomerDetails(prev => ({
                ...prev,
                name: prev.name || profile.full_name || "",
                phone: prev.phone || profile.mobile || "",
                address: prev.address || profile.address || "",
            }));
        }
    }, [profile]);

    // Flash Sale Logic
    const { data: sales } = useActiveSales();
    const { finalPrice, originalPrice, isSale } = getEffectivePrice(product, sales);

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const deliveryPrice = deliveryOption === "dhaka" ? deliveryDhakaPrice : deliveryOutsideDhakaPrice;
    const subtotal = finalPrice * quantity; // Use sale price
    const total = subtotal + deliveryPrice;

    const displayName = language === "bn" && product.name_bn ? product.name_bn : product.name;

    const handleCustomerDetailsChange = (field: string, value: string) => {
        setCustomerDetails(prev => ({ ...prev, [field]: value }));
    };

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState("");

    const handleApplyCoupon = async () => {
        setCouponError("");
        if (!couponCode.trim()) return;

        try {
            const coupon = await validateCoupon(couponCode.trim().toUpperCase());

            if (!coupon) {
                setCouponError(language === "bn" ? "ভুল কুপন কোড" : "Invalid coupon code");
                setAppliedCoupon(null);
                setDiscountAmount(0);
                return;
            }

            // Validate Scope
            let isValid = false;
            if (coupon.coupon_type === 'global') {
                isValid = true;
            } else if (coupon.coupon_type === 'category') {
                // Check if product belongs to category
                // Assuming product.categories is a single object {name: string} or array? 
                // The interface says product.categories: { name: string } | null;
                // Wait, I need category ID to match target_id. 
                // The Type definition says product & { categories: ... }
                // UseProducts hook usually returns categories as joined relation.
                // I might need to check product.category_id if available or fetch details.
                // Re-checking Product type in QuickOrderForm props: 
                // product: Product & { categories: { name: string } | null; ... }

                // If product has category_id directly:
                if (product.category_id === coupon.target_id) {
                    isValid = true;
                } else {
                    setCouponError(language === "bn" ? "এই পণ্যের জন্য কুপনটি প্রযোজ্য নয়" : "Coupon not applicable for this product category");
                }
            } else if (coupon.coupon_type === 'product') {
                if (coupon.target_id === product.id) {
                    isValid = true;
                } else {
                    setCouponError(language === "bn" ? "এই পণ্যের জন্য কুপনটি প্রযোজ্য নয়" : "Coupon not applicable for this product");
                }
            }

            if (isValid) {
                setAppliedCoupon(coupon);
                const discount = (finalPrice * quantity * coupon.discount_percent) / 100; // Use sale price
                setDiscountAmount(discount);
                toast({
                    title: language === "bn" ? "কুপন প্রয়োগ করা হয়েছে!" : "Coupon Applied!",
                    description: language === "bn" ? `${coupon.discount_percent}% ছাড়` : `${coupon.discount_percent}% discount applied`,
                });
            } else {
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }

        } catch (error) {
            console.error(error);
            setCouponError("Error checking coupon");
        }
    };

    // Recalculate discount if quantity changes
    useEffect(() => {
        if (appliedCoupon) {
            const discount = (finalPrice * quantity * appliedCoupon.discount_percent) / 100; // Use sale price
            setDiscountAmount(discount);
        }
    }, [quantity, appliedCoupon, finalPrice]);

    const handleOrderNow = async () => {
        // Validation for required fields
        if (!customerDetails.name.trim() || !customerDetails.phone.trim() || !customerDetails.address.trim()) {
            toast({
                title: language === "bn" ? "ত্রুটি" : "Error",
                description: language === "bn" ? "সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন" : "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Generate a random ID for guest orders if not logged in
            // Ideally use uuid library, but to avoid adding deps if not present, use crypto.randomUUID()
            const guestOrderId = !user ? crypto.randomUUID() : undefined;

            const order = await createOrder.mutateAsync({
                id: guestOrderId,
                order: {
                    user_id: user?.id, // Can be undefined for guests
                    customer_name: customerDetails.name,
                    customer_phone: customerDetails.phone,
                    customer_address: customerDetails.address,
                    delivery_area: deliveryOption,
                    delivery_price: deliveryPrice,
                    subtotal: subtotal,
                    total: total - discountAmount,
                    notes: customerDetails.notes || undefined,
                    discount: discountAmount,
                    coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
                    payment_method: selectedPaymentMethod,
                },
                items: [{
                    product_id: product.id,
                    product_name: product.name,
                    product_image: product.image_url || undefined,
                    quantity: quantity,
                    unit_price: finalPrice, // Use sale price
                    total_price: subtotal, // Already calculated with finalPrice
                }],
            });

            setOrderId(order.id);
            setOrderComplete(true);

            toast({
                title: language === "bn" ? "অর্ডার সফল!" : "Order Placed!",
                description: language === "bn" ? "আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে" : "Your order has been placed successfully",
            });
        } catch (error: any) {
            console.error("Quick order error:", error);
            toast({
                title: language === "bn" ? "ত্রুটি" : "Error",
                description: error.message || (language === "bn" ? "অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে" : "Failed to process your order"),
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setOrderComplete(false);
        setOrderId(null);
        setQuantity(1);
        setIsOpen(false);
        setAppliedCoupon(null);
        setCouponCode("");
        setDiscountAmount(0);
        setCouponError("");
    };

    // Order Complete State
    if (orderComplete && orderId) {
        return (
            <div className="mt-6 p-6 border border-primary/30 bg-primary/5 rounded-sm space-y-6">
                {/* Success Header */}
                <div className="text-center pb-4 border-b border-border">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-light text-foreground mb-2">
                        {language === "bn" ? "অর্ডার সফল হয়েছে!" : "Order Confirmed!"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {language === "bn" ? "অর্ডার আইডি:" : "Order ID:"}{" "}
                        <span className="font-mono font-medium">{orderId.slice(0, 8)}</span>
                    </p>
                </div>

                {/* Order Summary Details */}
                <div className="space-y-4">
                    {/* Product Details */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">
                            {language === "bn" ? "পণ্যের বিবরণ" : "Product Details"}
                        </h4>
                        <div className="flex items-center gap-4 p-3 bg-background rounded-sm border border-border">
                            <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                                <img
                                    src={product.image_url || '/placeholder.svg'}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-light text-sm">{displayName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {isSale ? (
                                        <>
                                            <p className="text-sm text-destructive font-medium">{formatPrice(finalPrice)}</p>
                                            <p className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                                    )}
                                    <span className="text-xs text-muted-foreground">× {quantity}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">
                            {language === "bn" ? "গ্রাহক তথ্য" : "Customer Information"}
                        </h4>
                        <div className="space-y-2 p-3 bg-background rounded-sm border border-border text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{language === "bn" ? "নাম:" : "Name:"}</span>
                                <span className="font-light">{customerDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{language === "bn" ? "ফোন:" : "Phone:"}</span>
                                <span className="font-light">{customerDetails.phone}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">{language === "bn" ? "ঠিকানা:" : "Address:"}</span>
                                <span className="font-light text-xs">{customerDetails.address}</span>
                            </div>
                            {customerDetails.notes && (
                                <div className="flex flex-col gap-1 pt-2 border-t border-border">
                                    <span className="text-muted-foreground">{language === "bn" ? "নোট:" : "Notes:"}</span>
                                    <span className="font-light text-xs">{customerDetails.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery & Payment Summary */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">
                            {language === "bn" ? "মূল্য বিবরণ" : "Price Breakdown"}
                        </h4>
                        <div className="space-y-2 p-3 bg-background rounded-sm border border-border text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {language === "bn" ? "সাবটোটাল" : "Subtotal"} ({quantity}x)
                                </span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {appliedCoupon && discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>
                                        {language === "bn" ? "ছাড়" : "Discount"} ({appliedCoupon.discount_percent}%)
                                    </span>
                                    <span>- {formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {language === "bn" ? "ডেলিভারি" : "Delivery"} ({deliveryOption === "dhaka" ? (language === "bn" ? "ঢাকা" : "Dhaka") : (language === "bn" ? "ঢাকার বাইরে" : "Outside Dhaka")})
                                </span>
                                <span>{formatPrice(deliveryPrice)}</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t border-border text-base">
                                <span>{language === "bn" ? "মোট" : "Total"}</span>
                                <span className="text-primary">{formatPrice(total - discountAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4 border-t border-border">
                    {selectedPaymentMethod !== 'cod' && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded-sm text-amber-900 dark:text-amber-100 text-sm">
                            <p className="font-semibold mb-1 text-xs uppercase tracking-wider">
                                {language === "bn" ? "পেমেন্ট নির্দেশনা" : "Payment Required"}
                            </p>
                            <p className="mb-2 text-xs">
                                {language === "bn"
                                    ? `দয়া করে ${formatPrice(total - discountAmount)} টাকা পাঠান:`
                                    : `Please send ${formatPrice(total - discountAmount)} to:`}
                            </p>
                            <div className="font-mono text-base font-medium bg-white/50 dark:bg-black/20 p-2 rounded mb-1 select-all">
                                {selectedPaymentMethod === 'bkash' ? paymentSettings.bkashNumber :
                                    selectedPaymentMethod === 'nagad' ? paymentSettings.nagadNumber :
                                        paymentSettings.bankInfo}
                            </div>
                        </div>
                    )}

                    <Button
                        className="w-full gap-2 h-12"
                        onClick={() => {
                            const paymentMethodLabel = selectedPaymentMethod === 'cod' ? "Cash On Delivery" :
                                selectedPaymentMethod === 'bkash' ? "bKash" :
                                    selectedPaymentMethod === 'nagad' ? "Nagad" :
                                        selectedPaymentMethod === 'bank' ? "Bank Transfer" : selectedPaymentMethod;

                            const message = language === "bn"
                                ? `হাই, আমি আপডেট অর্ডার #${orderId.slice(0, 8)} নিশ্চিত করতে চাই। ${selectedPaymentMethod !== 'cod' ? `\n\nপেমেন্ট মেথড: ${paymentMethodLabel}\nআমার পেমেন্ট স্ক্রিনশট/আইডি এখানে দিচ্ছি।` : ''}`
                                : `Hi, I want to confirm my updated order #${orderId.slice(0, 8)}. ${selectedPaymentMethod !== 'cod' ? `\n\nPayment Method: ${paymentMethodLabel}\nHere is my payment proof/Transaction ID.` : ''}`;
                            window.open(`https://wa.me/${contactInfo?.whatsapp?.replace(/[^0-9]/g, "") || "8801759772325"}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.272-.57-.421" /></svg>
                        {selectedPaymentMethod !== 'cod' ? (language === "bn" ? "পেমেন্ট প্রুফ পাঠান" : "Send Payment Proof") : (language === "bn" ? "হোয়াটসঅ্যাপে নিশ্চিত করুন" : "Confirm on WhatsApp")}
                    </Button>
                    <Button variant="outline" className="w-full h-12" onClick={resetForm}>
                        {language === "bn" ? "আরেকটি অর্ডার করুন" : "Place Another Order"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 border-t border-border pt-6">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        data-order-now-button
                        className="w-full h-14 justify-between font-medium rounded-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                    >
                        <span className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <span className="text-base">
                                {language === "bn" ? "এখনই অর্ডার করুন" : "Order Now"}
                            </span>
                        </span>
                        <span className="flex items-center gap-2 text-sm bg-primary-foreground/20 px-3 py-1 rounded-full">
                            {language === "bn" ? "কার্ট ছাড়াই" : "Skip Cart"}
                        </span>
                        {/* Subtle premium shine animation */}
                        <div className="absolute inset-0 w-full h-full">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="absolute inset-0 bg-white/10 w-1/2 -skew-x-12 translate-x-[-200%] animate-[shimmer_4s_infinite] pointer-events-none"
                                style={{
                                    animation: 'shimmer 4s infinite linear',
                                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                                }}
                            />
                        </div>
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-4 space-y-6">
                    {/* Order Form used to be blocked here */}


                    {/* Order Form - show even if not logged in so user can see what's needed */}
                    <div className="space-y-5">
                        {/* Product & Quantity Summary */}
                        <div className="p-4 bg-muted/20 rounded-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                                    <img
                                        src={product.image_url || '/placeholder.svg'}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-light text-sm truncate">{displayName}</h4>
                                    <div className="flex items-center gap-2">
                                        {isSale ? (
                                            <>
                                                <p className="text-sm text-destructive font-medium">{formatPrice(finalPrice)}</p>
                                                <p className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                <span className="text-sm text-muted-foreground">
                                    {language === "bn" ? "পরিমাণ" : "Quantity"}
                                </span>
                                <div className="flex items-center border border-border">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={decrementQuantity}
                                        className="h-8 w-8 p-0 hover:bg-transparent hover:opacity-50 rounded-none"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="h-8 flex items-center px-3 text-sm font-light min-w-10 justify-center border-l border-r border-border">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={incrementQuantity}
                                        className="h-8 w-8 p-0 hover:bg-transparent hover:opacity-50 rounded-none"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Options */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-light">
                                    {language === "bn" ? "ডেলিভারি অপশন" : "Delivery Option"}
                                </h4>
                            </div>
                            <RadioGroup
                                value={deliveryOption}
                                onValueChange={(val: "dhaka" | "outside_dhaka") => setDeliveryOption(val)}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between p-3 border border-border rounded-sm bg-background">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="dhaka" id="quick-dhaka" />
                                        <Label htmlFor="quick-dhaka" className="font-light text-sm cursor-pointer">
                                            {language === "bn" ? "ঢাকার ভিতরে" : "Inside Dhaka"}
                                        </Label>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{formatPrice(deliveryDhakaPrice)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-border rounded-sm bg-background">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="outside_dhaka" id="quick-outside" />
                                        <Label htmlFor="quick-outside" className="font-light text-sm cursor-pointer">
                                            {language === "bn" ? "ঢাকার বাইরে" : "Outside Dhaka"}
                                        </Label>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{formatPrice(deliveryOutsideDhakaPrice)}</span>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Customer Details Form */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-light">
                                {language === "bn" ? "গ্রাহক তথ্য" : "Customer Details"}
                            </h4>

                            <div>
                                <Label htmlFor="quick-name" className="text-xs font-light text-muted-foreground">
                                    {language === "bn" ? "নাম *" : "Full Name *"}
                                </Label>
                                <Input
                                    id="quick-name"
                                    type="text"
                                    value={customerDetails.name}
                                    onChange={(e) => handleCustomerDetailsChange("name", e.target.value)}
                                    className="mt-1 rounded-none h-10"
                                    placeholder={language === "bn" ? "আপনার নাম" : "Enter your name"}
                                />
                            </div>

                            <div>
                                <Label htmlFor="quick-phone" className="text-xs font-light text-muted-foreground">
                                    {language === "bn" ? "ফোন নম্বর *" : "Phone Number *"}
                                </Label>
                                <Input
                                    id="quick-phone"
                                    type="tel"
                                    value={customerDetails.phone}
                                    onChange={(e) => handleCustomerDetailsChange("phone", e.target.value)}
                                    className="mt-1 rounded-none h-10"
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>

                            <div>
                                <Label htmlFor="quick-address" className="text-xs font-light text-muted-foreground">
                                    {language === "bn" ? "সম্পূর্ণ ঠিকানা *" : "Full Address *"}
                                </Label>
                                <Textarea
                                    id="quick-address"
                                    value={customerDetails.address}
                                    onChange={(e) => handleCustomerDetailsChange("address", e.target.value)}
                                    className="mt-1 rounded-none min-h-[80px]"
                                    placeholder={language === "bn" ? "বাসা, রাস্তা, এলাকা, শহর" : "House, Street, Area, City"}
                                />
                            </div>

                            <div>
                                <Label htmlFor="quick-notes" className="text-xs font-light text-muted-foreground">
                                    {language === "bn" ? "অতিরিক্ত নোট (ঐচ্ছিক)" : "Additional Notes (Optional)"}
                                </Label>
                                <Textarea
                                    id="quick-notes"
                                    value={customerDetails.notes}
                                    onChange={(e) => handleCustomerDetailsChange("notes", e.target.value)}
                                    className="mt-1 rounded-none min-h-[60px]"
                                    placeholder={language === "bn" ? "বিশেষ নির্দেশনা" : "Special instructions"}
                                />
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-light">
                                    {language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
                                </h4>
                            </div>
                            <RadioGroup
                                value={selectedPaymentMethod}
                                onValueChange={setSelectedPaymentMethod}
                                className="space-y-2"
                            >
                                {paymentSettings.showBkash && (
                                    <div className={`relative flex items-center space-x-3 p-3 border rounded-sm transition-all ${selectedPaymentMethod === 'bkash' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                                        <RadioGroupItem value="bkash" id="q-pm-bkash" />
                                        <Label htmlFor="q-pm-bkash" className="flex-1 cursor-pointer flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#e2136e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Smartphone className="h-4 w-4 text-[#e2136e]" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-sm">bKash</span>
                                                    <p className="text-[10px] font-mono text-muted-foreground">{paymentSettings.bkashNumber}</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}

                                {paymentSettings.showNagad && (
                                    <div className={`relative flex items-center space-x-3 p-3 border rounded-sm transition-all ${selectedPaymentMethod === 'nagad' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                                        <RadioGroupItem value="nagad" id="q-pm-nagad" />
                                        <Label htmlFor="q-pm-nagad" className="flex-1 cursor-pointer flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#f7941d]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Smartphone className="h-4 w-4 text-[#f7941d]" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-sm">Nagad</span>
                                                    <p className="text-[10px] font-mono text-muted-foreground">{paymentSettings.nagadNumber}</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}

                                {paymentSettings.showBank && (
                                    <div className={`relative flex items-center space-x-3 p-3 border rounded-sm transition-all ${selectedPaymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                                        <RadioGroupItem value="bank" id="q-pm-bank" />
                                        <Label htmlFor="q-pm-bank" className="flex-1 cursor-pointer flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-sm">Bank</span>
                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">Transfer</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                )}

                                <div className={`relative flex items-center space-x-3 p-3 border rounded-sm transition-all ${selectedPaymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                                    <RadioGroupItem value="cod" id="q-pm-cod" />
                                    <Label htmlFor="q-pm-cod" className="flex-1 cursor-pointer flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100/50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Truck className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm">{language === "bn" ? "ক্যাশ অন ডেলিভারি" : "COD"}</span>
                                            <p className="text-[10px] text-muted-foreground">{language === "bn" ? "পণ্য হাতে পেয়ে পেমেন্ট" : "Cash on Delivery"}</p>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Coupon Code Section */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Label className="text-sm font-light">
                                {language === "bn" ? "কুপন কোড (যদি থাকে)" : "Coupon Code (Optional)"}
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder={language === "bn" ? "কোড লিখুন" : "Enter code"}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="rounded-none h-10 uppercase"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleApplyCoupon}
                                    type="button"
                                    className="h-10 rounded-none"
                                >
                                    {language === "bn" ? "প্রয়োগ করুন" : "Apply"}
                                </Button>
                            </div>

                            {couponError && (
                                <p className="text-xs text-destructive">{couponError}</p>
                            )}

                            {appliedCoupon && (
                                <div className="text-xs text-green-600 flex items-center gap-1 bg-green-50 p-2 border border-green-200">
                                    <Check className="h-3 w-3" />
                                    <span>
                                        {language === "bn"
                                            ? `কুপন '${appliedCoupon.code}' প্রয়োগ করা হয়েছে (${appliedCoupon.discount_percent}% ছাড়)`
                                            : `Coupon '${appliedCoupon.code}' applied (${appliedCoupon.discount_percent}% OFF)`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Order Summary & Submit */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {language === "bn" ? "সাবটোটাল" : "Subtotal"} ({quantity}x)
                                </span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>
                                        {language === "bn" ? "ছাড়" : "Discount"} ({appliedCoupon.discount_percent}%)
                                    </span>
                                    <span>- {formatPrice(discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {language === "bn" ? "ডেলিভারি" : "Delivery"}
                                </span>
                                <span>{formatPrice(deliveryPrice)}</span>
                            </div>
                            <div className="flex justify-between text-base font-medium pt-2 border-t border-border">
                                <span>{language === "bn" ? "মোট" : "Total"}</span>
                                <span>{formatPrice(total - discountAmount)}</span>
                            </div>

                            <Button
                                onClick={handleOrderNow}
                                disabled={isProcessing}
                                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-light rounded-none"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        {language === "bn" ? "প্রক্রিয়াকরণ হচ্ছে..." : "Processing..."}
                                    </span>
                                ) : (
                                    <span>
                                        {language === "bn" ? "অর্ডার কনফার্ম করুন" : "Confirm Order"} — {formatPrice(total - discountAmount)}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

export default QuickOrderForm;
