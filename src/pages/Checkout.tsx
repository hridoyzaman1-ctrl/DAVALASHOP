import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Check, Truck, Package, LogIn, Smartphone, Building2, Wallet } from "lucide-react";
import CheckoutHeader from "../components/header/CheckoutHeader";
import Footer from "../components/footer/Footer";
import WhatsAppContact from "../components/checkout/WhatsAppContact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/contexts/SettingsContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/components/ui/use-toast";
import { useActiveSales } from "@/hooks/useSales";
import { getEffectivePrice } from "@/lib/priceUtils";

const Checkout = () => {
  const navigate = useNavigate();
  const { t, language, formatPrice, deliveryDhakaPrice, deliveryOutsideDhakaPrice, paymentSettings, contactInfo } = useSettings();
  const { items, updateQuantity, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent: number;
    type: 'global' | 'category' | 'product';
    targetId: string | null;
  } | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);


  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cod");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [deliveryOption, setDeliveryOption] = useState<"dhaka" | "outside_dhaka">("dhaka");
  const [isProcessing, setIsProcessing] = useState(false);

  // Order Success State
  interface OrderSuccessData {
    id: string;
    customer: {
      name: string;
      phone: string;
      address: string;
    };
    items: typeof items;
    costs: {
      subtotal: number;
      delivery: number;
      discount: number;
      total: number;
    };
    paymentMethod: string;
  }
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSuccessData | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user && items.length > 0) {
      // Don't redirect immediately, show the login prompt instead
    }
  }, [user, authLoading, items.length]);

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

  // Sale Hook
  const { data: activeSales } = useActiveSales();

  // Helper: Calculate item price with potential sale
  const getItemEffectivePrice = (item: any) => {
    // Construct a Product-like object for getEffectivePrice
    const productLike = {
      id: item.id,
      price: item.price,
      category_id: item.categoryId
    } as any;

    const { finalPrice } = getEffectivePrice(productLike, activeSales);
    return finalPrice;
  }

  const deliveryPrice = deliveryOption === "dhaka" ? deliveryDhakaPrice : deliveryOutsideDhakaPrice;

  // Calculate subtotal with Sales
  const effectiveSubtotal = items.reduce((acc, item) => {
    return acc + (getItemEffectivePrice(item) * item.quantity);
  }, 0);

  // Calculate discount based on coupon rules (applied on Effective Price)
  const discountAmount = appliedCoupon ? items.reduce((acc, item) => {
    let isEligible = false;

    if (appliedCoupon.type === 'global') {
      isEligible = true;
    } else if (appliedCoupon.type === 'category') {
      // Check categoryId is populated
      isEligible = item.categoryId === appliedCoupon.targetId;
    } else if (appliedCoupon.type === 'product') {
      isEligible = item.id === appliedCoupon.targetId;
    }

    if (isEligible) {
      // Coupon applies to the price AFTER flash sale
      const price = getItemEffectivePrice(item);
      return acc + ((price * item.quantity) * appliedCoupon.percent / 100);
    }
    return acc;
  }, 0) : 0;

  const total = effectiveSubtotal + deliveryPrice - discountAmount;

  const handleCustomerDetailsChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsCheckingCoupon(true);
    try {
      // Manually importing supabase for this specific check to avoid hook overhead
      const { supabase } = await import("@/integrations/supabase/client");

      const { data, error } = await supabase
        .from('coupons' as any)
        .select('*')
        .eq('code', couponCode.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      const couponData = data as any;

      if (!couponData) {
        toast({
          title: language === "bn" ? "ভুল কুপন" : "Invalid Coupon",
          description: language === "bn" ? "এই কুপন কোডটি সঠিক নয়" : "This coupon code is invalid or expired",
          variant: "destructive",
        });
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: couponData.code,
          percent: Number(couponData.discount_percent),
          type: couponData.coupon_type,
          targetId: couponData.target_id
        });
        toast({
          title: language === "bn" ? "কুপন প্রয়োগ করা হয়েছে" : "Coupon Applied",
          description: language === "bn"
            ? `${couponData.discount_percent}% ছাড় প্রয়োগ করা হয়েছে`
            : `${couponData.discount_percent}% discount applied`,
        });
      }
    } catch (error) {
      console.error("Coupon check error:", error);
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive"
      });
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleCompleteOrder = async () => {
    // Validate required fields
    if (!customerDetails.name.trim() || !customerDetails.phone.trim() || !customerDetails.address.trim()) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন" : "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: language === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare full success data first
      const successPayload: OrderSuccessData = {
        id: "", // Will update after creation
        customer: { ...customerDetails },
        items: [...items],
        costs: {
          subtotal: effectiveSubtotal,
          delivery: deliveryPrice,
          discount: discountAmount,
          total
        },
        paymentMethod: selectedPaymentMethod === 'cod' ? "Cash On Delivery" :
          selectedPaymentMethod === 'bkash' ? "bKash" :
            selectedPaymentMethod === 'nagad' ? "Nagad" :
              selectedPaymentMethod === 'bank' ? "Bank Transfer" : selectedPaymentMethod
      };

      const order = await createOrder.mutateAsync({
        order: {
          user_id: user?.id,
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          customer_address: customerDetails.address,
          delivery_area: deliveryOption,
          delivery_price: deliveryPrice,
          subtotal: effectiveSubtotal,
          total: total,
          discount: discountAmount,
          coupon_code: appliedCoupon?.code,
          payment_method: selectedPaymentMethod,
          notes: customerDetails.notes || undefined,
        },
        items: items.map(item => {
          const effectivePrice = getItemEffectivePrice(item);
          return {
            product_id: item.id,
            product_name: item.name,
            product_image: item.image,
            quantity: item.quantity,
            unit_price: effectivePrice, // Store the FINAL sale price
            total_price: effectivePrice * item.quantity,
          }
        }),
      });

      // Update ID and set success state
      successPayload.id = order.id;
      setOrderSuccessData(successPayload);
      clearCart();

      toast({
        title: language === "bn" ? "অর্ডার সফল!" : "Order Placed!",
        description: language === "bn" ? "আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে" : "Your order has been placed successfully",
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: language === "bn" ? "ত্রুটি" : "Error",
        description: error.message || (language === "bn" ? "অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে" : "Failed to process your order"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccessData) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="pt-6 pb-12">
          <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-light text-foreground mb-4">
                {language === "bn" ? "অর্ডার সফল হয়েছে!" : "Order Confirmed!"}
              </h1>
              <p className="text-muted-foreground mb-2">
                {language === "bn" ? "অর্ডার আইডি:" : "Order ID:"} <span className="font-mono text-foreground font-medium">{orderSuccessData.id.slice(0, 8)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "bn"
                  ? "আমরা আপনার অর্ডারটি পেয়েছি। শীঘ্রই একজন প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।"
                  : "We have received your order. A representative will contact you shortly."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Order Details Column */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium border-b pb-3 mb-4">
                    {language === "bn" ? "অর্ডার আইটেম" : "Order Items"}
                  </h3>
                  <div className="space-y-4">
                    {orderSuccessData.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{language === "bn" && item.nameBn ? item.nameBn : item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium border-b pb-3 mb-4">
                    {language === "bn" ? "পেমেন্ট সারাংশ" : "Payment Summary"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                      <span>{formatPrice(orderSuccessData.costs.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === "bn" ? "ডেলিভারি" : "Delivery"}</span>
                      <span>{formatPrice(orderSuccessData.costs.delivery)}</span>
                    </div>
                    {orderSuccessData.costs.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{language === "bn" ? "ডিসকাউন্ট" : "Discount"}</span>
                        <span>-{formatPrice(orderSuccessData.costs.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg pt-2 border-t mt-2">
                      <span>{language === "bn" ? "মোট" : "Total"}</span>
                      <span>{formatPrice(orderSuccessData.costs.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info Column */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium border-b pb-3 mb-4">
                    {language === "bn" ? "ডেলিভারি তথ্য" : "Delivery Details"}
                  </h3>
                  <div className="space-y-3 text-sm">
                    {orderSuccessData.paymentMethod !== 'Cash On Delivery' && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md mb-4 text-amber-900 dark:text-amber-100">
                        <p className="font-semibold mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          {language === "bn" ? "পেমেন্ট নির্দেশনা" : "Payment Required"}
                        </p>
                        <p className="mb-2">
                          {language === "bn"
                            ? `অনুগ্রহ করে ${formatPrice(orderSuccessData.costs.total)} টাকা নিচের নাম্বারে পাঠান:`
                            : `Please send ${formatPrice(orderSuccessData.costs.total)} to the following number:`}
                        </p>
                        <div className="font-mono text-lg font-medium tracking-wider bg-white/50 dark:bg-black/20 p-2 rounded mb-2 select-all">
                          {orderSuccessData.paymentMethod === 'bKash' ? paymentSettings.bkashNumber :
                            orderSuccessData.paymentMethod === 'Nagad' ? paymentSettings.nagadNumber :
                              paymentSettings.bankInfo}
                        </div>
                        <p className="text-xs opacity-90">
                          {language === "bn"
                            ? "পেমেন্ট সম্পন্ন করে নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করে স্ক্রিনশট বা ট্রানজেকশন আইডি পাঠান।"
                            : "After payment, please click the WhatsApp button below to send your payment screenshot or Transaction ID."}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        {language === "bn" ? "নাম" : "Name"}
                      </span>
                      <p className="font-medium">{orderSuccessData.customer.name}</p>
                    </div>
                    <div>
                      <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        {language === "bn" ? "ফোন" : "Phone"}
                      </span>
                      <p className="font-medium">{orderSuccessData.customer.phone}</p>
                    </div>
                    <div>
                      <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        {language === "bn" ? "ঠিকানা" : "Address"}
                      </span>
                      <p className="whitespace-pre-wrap">{orderSuccessData.customer.address}</p>
                    </div>
                    <div>
                      <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        {language === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}
                      </span>
                      <p className="font-medium text-primary">{orderSuccessData.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-3 text-center">
                    {language === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Your Order"}
                  </h4>
                  <Button
                    className="w-full gap-2 mb-3"
                    onClick={() => {
                      const message = language === "bn"
                        ? `হাই, আমি অর্ডার #${orderSuccessData.id.slice(0, 8)} নিশ্চিত করতে চাই। ${orderSuccessData.paymentMethod !== 'Cash On Delivery' ? `\n\nপেমেন্ট মেথড: ${orderSuccessData.paymentMethod}\nআমার পেমেন্ট স্ক্রিনশট/আইডি এখানে দিচ্ছি।` : ''}`
                        : `Hi, I want to confirm my order #${orderSuccessData.id.slice(0, 8)}. ${orderSuccessData.paymentMethod !== 'Cash On Delivery' ? `\n\nPayment Method: ${orderSuccessData.paymentMethod}\nHere is my payment proof/Transaction ID.` : ''}`;
                      window.open(`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.272-.57-.421" /></svg>
                    {language === "bn" ? "হোয়াটসঅ্যাপ বার্তা পাঠান" : "Confirm on WhatsApp"}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                    {language === "bn" ? "কেনাকাটা চালিয়ে যান" : "Continue Shopping"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="pt-6 pb-12">
          <div className="max-w-2xl mx-auto px-6 text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-light text-foreground mb-4">
              {language === "bn" ? "আপনার কার্ট খালি" : "Your Cart is Empty"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {language === "bn"
                ? "কেনাকাটা শুরু করতে আমাদের পণ্য দেখুন"
                : "Browse our products to start shopping"}
            </p>
            <Button onClick={() => navigate("/category/skincare")} className="rounded-none">
              {language === "bn" ? "শপিং শুরু করুন" : "Start Shopping"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show login prompt if not authenticated, but allow proceeding as guest
  // This section is removed to allow guest checkout


  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />

      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Order Summary */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-muted/20 p-8 rounded-none sticky top-6">
                <h2 className="text-lg font-light text-foreground mb-6">
                  {language === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}
                </h2>

                <div className="space-y-6">
                  {items.map((item) => {
                    const effectivePrice = getItemEffectivePrice(item);
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-none overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={language === "bn" && item.nameBn ? item.nameBn : item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-light text-foreground text-sm truncate">
                            {language === "bn" && item.nameBn ? item.nameBn : item.name}
                          </h3>

                          {/* Price Per Unit Display */}
                          <div className="text-sm">
                            {effectivePrice < item.price ? (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground line-through text-xs">{formatPrice(item.price)}</span>
                                <span className="text-red-600 font-medium">{formatPrice(effectivePrice)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{formatPrice(item.price)}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 p-0 rounded-none border-muted-foreground/20"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium text-foreground min-w-[2ch] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 p-0 rounded-none border-muted-foreground/20"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-foreground font-medium text-sm whitespace-nowrap flex flex-col items-end">
                          {effectivePrice < item.price ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(item.price * item.quantity)}</span>
                              <span className="text-red-600">{formatPrice(effectivePrice * item.quantity)}</span>
                            </>
                          ) : (
                            formatPrice(item.price * item.quantity)
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-muted-foreground/20 mt-6 pt-6 space-y-3">
                  {/* Coupon Input */}
                  <div className="mb-4">
                    <Label className="text-xs uppercase text-muted-foreground mb-2 block">
                      {language === "bn" ? "কুপন কোড (ঐচ্ছিক)" : "Coupon Code (Optional)"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={language === "bn" ? "কুপন কোড লিখুন" : "Enter coupon code"}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-background rounded-none"
                      />
                      <Button
                        variant="outline"
                        className="rounded-none bg-background"
                        onClick={handleApplyCoupon}
                        disabled={isCheckingCoupon || !couponCode}
                      >
                        {isCheckingCoupon ? "..." : (language === "bn" ? "প্রয়োগ" : "Apply")}
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {language === "bn"
                          ? `কুপন '${appliedCoupon.code}' প্রয়োগ করা হয়েছে (${appliedCoupon.percent}% ছাড়)`
                          : `Coupon '${appliedCoupon.code}' applied (${appliedCoupon.percent}% OFF)`}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === "bn" ? "সাবটোটাল" : "Subtotal"}
                    </span>
                    <span className="text-foreground">{formatPrice(effectiveSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === "bn" ? "ডেলিভারি" : "Delivery"}
                    </span>
                    <span className="text-foreground">{formatPrice(deliveryPrice)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        {language === "bn" ? `ডিসকাউন্ট (${appliedCoupon?.percent}%)` : `Discount (${appliedCoupon?.percent}%)`}
                      </span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-medium pt-3 border-t border-muted-foreground/20">
                    <span className="text-foreground">
                      {language === "bn" ? "মোট" : "Total"}
                    </span>
                    <span className="text-foreground">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forms */}
            <div className="lg:col-span-2 lg:order-1 space-y-8">

              {/* Customer Details Form */}
              <div className="bg-muted/20 p-8 rounded-none">
                <h2 className="text-lg font-light text-foreground mb-6">
                  {language === "bn" ? "গ্রাহক তথ্য" : "Customer Details"}
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-light text-foreground">
                      {language === "bn" ? "নাম *" : "Full Name *"}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) => handleCustomerDetailsChange("name", e.target.value)}
                      className="mt-2 rounded-none"
                      placeholder={language === "bn" ? "আপনার নাম লিখুন" : "Enter your full name"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-light text-foreground">
                      {language === "bn" ? "ফোন নম্বর *" : "Phone Number *"}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => handleCustomerDetailsChange("phone", e.target.value)}
                      className="mt-2 rounded-none"
                      placeholder={language === "bn" ? "০১XXXXXXXXX" : "01XXXXXXXXX"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-light text-foreground">
                      {language === "bn" ? "সম্পূর্ণ ঠিকানা *" : "Full Address *"}
                    </Label>
                    <Textarea
                      id="address"
                      value={customerDetails.address}
                      onChange={(e) => handleCustomerDetailsChange("address", e.target.value)}
                      className="mt-2 rounded-none min-h-[100px]"
                      placeholder={language === "bn" ? "বাসা নং, রাস্তা, এলাকা, শহর" : "House no, Street, Area, City"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-light text-foreground">
                      {language === "bn" ? "অতিরিক্ত নোট (ঐচ্ছিক)" : "Additional Notes (Optional)"}
                    </Label>
                    <Textarea
                      id="notes"
                      value={customerDetails.notes}
                      onChange={(e) => handleCustomerDetailsChange("notes", e.target.value)}
                      className="mt-2 rounded-none"
                      placeholder={language === "bn" ? "বিশেষ নির্দেশনা বা নোট" : "Special instructions or notes"}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-muted/20 p-8 rounded-none">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-light text-foreground">
                    {language === "bn" ? "ডেলিভারি অপশন" : "Delivery Option"}
                  </h2>
                </div>

                <RadioGroup
                  value={deliveryOption}
                  onValueChange={(val: "dhaka" | "outside_dhaka") => setDeliveryOption(val)}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between p-4 border border-border rounded-sm bg-background">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="dhaka" id="dhaka-checkout" />
                      <Label htmlFor="dhaka-checkout" className="font-light text-foreground cursor-pointer">
                        {language === "bn" ? "ঢাকার ভিতরে" : "Inside Dhaka"}
                      </Label>
                    </div>
                    <span className="text-foreground font-medium">{formatPrice(deliveryDhakaPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-sm bg-background">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="outside_dhaka" id="outside-checkout" />
                      <Label htmlFor="outside-checkout" className="font-light text-foreground cursor-pointer">
                        {language === "bn" ? "ঢাকার বাইরে" : "Outside Dhaka"}
                      </Label>
                    </div>
                    <span className="text-foreground font-medium">{formatPrice(deliveryOutsideDhakaPrice)}</span>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-muted/20 p-8 rounded-none">
                <div className="flex items-center gap-2 mb-6">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-light text-foreground">
                    {language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
                  </h2>
                </div>

                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-4"
                >
                  {paymentSettings.showBkash && (
                    <div className={`relative flex items-center space-x-3 p-4 border rounded-sm transition-all ${selectedPaymentMethod === 'bkash' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                      <RadioGroupItem value="bkash" id="pm-bkash" />
                      <Label htmlFor="pm-bkash" className="flex-1 cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#e2136e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Smartphone className="h-5 w-5 text-[#e2136e]" />
                          </div>
                          <div>
                            <span className="font-medium">bKash Personal</span>
                            <p className="text-sm font-mono tracking-wider">{paymentSettings.bkashNumber}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  {paymentSettings.showNagad && (
                    <div className={`relative flex items-center space-x-3 p-4 border rounded-sm transition-all ${selectedPaymentMethod === 'nagad' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                      <RadioGroupItem value="nagad" id="pm-nagad" />
                      <Label htmlFor="pm-nagad" className="flex-1 cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f7941d]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Smartphone className="h-5 w-5 text-[#f7941d]" />
                          </div>
                          <div>
                            <span className="font-medium">Nagad Personal</span>
                            <p className="text-sm font-mono tracking-wider">{paymentSettings.nagadNumber}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  {paymentSettings.showBank && (
                    <div className={`relative flex items-center space-x-3 p-4 border rounded-sm transition-all ${selectedPaymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                      <RadioGroupItem value="bank" id="pm-bank" />
                      <Label htmlFor="pm-bank" className="flex-1 cursor-pointer flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium">Bank Transfer</span>
                            <p className="text-xs text-muted-foreground whitespace-pre-line leading-tight mt-1 max-w-[200px] sm:max-w-xs">{paymentSettings.bankInfo}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  {/* Cash On Delivery Option - Always available or controlled by settings if preferred, but usually always on for this user */}
                  <div className={`relative flex items-center space-x-3 p-4 border rounded-sm transition-all ${selectedPaymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                    <RadioGroupItem value="cod" id="pm-cod" />
                    <Label htmlFor="pm-cod" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium">{language === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}</span>
                        <p className="text-xs text-muted-foreground">{language === "bn" ? "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন" : "Pay with cash upon delivery"}</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handleCompleteOrder}
                disabled={isProcessing}
                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none text-base"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    {language === "bn" ? "প্রক্রিয়াকরণ হচ্ছে..." : "Processing..."}
                  </span>
                ) : (
                  <span>
                    {language === "bn" ? "অর্ডার কনফার্ম করুন" : "Confirm Order"} — {formatPrice(total)}
                  </span>
                )}
              </Button>

              <WhatsAppContact />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
