import { useActiveCoupons } from "@/hooks/useCoupons";
import { useActiveSales } from "@/hooks/useSales"; // Added
import { useSettings } from "@/contexts/SettingsContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { TicketPercent, Zap } from "lucide-react"; // Added Zap
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const CouponBanner = () => {
    const { data: coupons } = useActiveCoupons();
    const { data: sales } = useActiveSales(); // Added
    const { language } = useSettings();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch details for name resolution
    const { data: products } = useProducts();
    const { data: categories } = useCategories();

    // Prepare unified promo list
    const activeCoupons = (coupons || []).map(img => ({ type: 'coupon' as const, data: img }));
    const activeSales = (sales || []).map(img => ({ type: 'sale' as const, data: img }));

    // START: Filter invalid sales (already done in hook but good effectively)
    // The hook returns active sales.

    const allPromos = [...activeCoupons, ...activeSales];

    useEffect(() => {
        if (allPromos.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % allPromos.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [allPromos.length]);

    if (!allPromos.length) return null;

    const currentPromo = allPromos[currentIndex % allPromos.length]; // Safeguard index

    const getTargetName = (type: string, id: string | null) => {
        if (type === 'category' && categories) {
            return categories.find((c: any) => c.id === id)?.name || "";
        }
        if (type === 'product' && products) {
            return products.find((p: any) => p.id === id)?.name || "";
        }
        return "";
    };

    const renderPromoContent = () => {
        if (currentPromo.type === 'coupon') {
            const coupon = currentPromo.data;
            const targetName = getTargetName(coupon.coupon_type, coupon.target_id);
            let text = "";

            if (language === "bn") {
                text = targetName ? `${targetName}-এ ${coupon.discount_percent}% ছাড়` : `${coupon.discount_percent}% ছাড়`;
            } else {
                text = targetName ? `${coupon.discount_percent}% OFF on ${targetName}` : `Get ${coupon.discount_percent}% OFF`;
            }

            return (
                <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
                    <TicketPercent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>
                        {language === "bn" ? "ভাউচার কোড ব্যবহার করুন" : "Use Voucher Code"}:
                        <span className="font-bold ml-1 bg-white/20 px-2 py-0.5 rounded border border-white/30 tracking-wider">
                            {coupon.code}
                        </span>
                        <span className="ml-2">({text})</span>
                    </span>
                </div>
            );
        } else {
            // Sale
            const sale = currentPromo.data;
            const targetName = getTargetName(sale.sale_type, sale.target_id);
            let text = "";

            if (language === "bn") {
                text = targetName ? `${targetName}-এ ফ্ল্যাশ সেল! ${sale.discount_percent}% ছাড়` : `ফ্ল্যাশ সেল! সব পণ্যে ${sale.discount_percent}% ছাড়`;
            } else {
                text = targetName ? `FLASH SALE! ${sale.discount_percent}% OFF on ${targetName}` : `FLASH SALE! ${sale.discount_percent}% OFF Everything`;
            }

            return (
                <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-white">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400 animate-pulse" />
                    <span className="font-bold tracking-wide uppercase">
                        {text}
                    </span>
                    {sale.end_time && (
                        <span className="text-xs bg-red-600 px-1.5 py-0.5 rounded ml-2 animate-pulse">
                            {language === "bn" ? "সীমিত সময়ের জন্য!" : "Limited Time!"}
                        </span>
                    )}
                </div>
            );
        }
    };

    return (
        <div className={`py-2 px-4 overflow-hidden relative transition-colors duration-500 ${currentPromo.type === 'sale' ? 'bg-black' : 'bg-primary'} text-primary-foreground`}>
            <div className="container flex justify-center items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPromo.type + (currentPromo.type === 'coupon' ? currentPromo.data.id : currentPromo.data.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderPromoContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CouponBanner;
