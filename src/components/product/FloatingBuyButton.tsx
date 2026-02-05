import { useState, useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingBuyButtonProps {
    onBuyNowClick: () => void;
    productId: string;
}

const FloatingBuyButton = ({ onBuyNowClick, productId }: FloatingBuyButtonProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Always show button after a short delay for better UX
        const timer = setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [productId]); // Reappear whenever productId changes

    const handleDismiss = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
        }, 300);
    };

    const handleBuyClick = () => {
        onBuyNowClick();
        // Dismiss after clicking
        handleDismiss();
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-24 right-6 z-50 transition-all duration-300 ease-out",
                isAnimating ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
            )}
        >
            <div className="relative group">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors z-10 shadow-lg"
                    aria-label="Dismiss"
                >
                    <X className="w-3 h-3" />
                </button>

                {/* Main Buy Now Button */}
                <Button
                    onClick={handleBuyClick}
                    size="lg"
                    className="h-14 px-6 gap-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-amber-950 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full group-hover:scale-105 animate-pulse-slow border border-amber-200"
                >
                    <div className="w-10 h-10 bg-amber-950/10 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs opacity-90 leading-none">Quick Order</span>
                        <span className="text-base font-semibold leading-none mt-1">BUY NOW</span>
                    </div>
                </Button>

                {/* Pulsing ring animation */}
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping-slow pointer-events-none" />
            </div>
        </div>
    );
};

export default FloatingBuyButton;
