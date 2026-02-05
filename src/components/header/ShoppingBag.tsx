import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { useCart } from "@/contexts/CartContext";

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFavorites?: () => void;
}

const ShoppingBag = ({ isOpen, onClose, onViewFavorites }: ShoppingBagProps) => {
  const { t, language, formatPrice } = useSettings();
  const { items, updateQuantity, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 h-screen"
        onClick={onClose}
      />

      {/* Off-canvas panel */}
      <div className="absolute right-0 top-0 h-screen w-96 max-w-full bg-background border-l border-border animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-light text-foreground">{t("bag.title")}</h2>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Mobile favorites toggle - only show on mobile */}
          {onViewFavorites && (
            <div className="md:hidden mb-6 pb-6 border-b border-border">
              <button
                onClick={onViewFavorites}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg text-foreground hover:text-muted-foreground hover:border-muted-foreground transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span className="text-sm font-light">{t("bag.view_favorites")}</span>
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                {t("bag.empty")}<br />
                {t("bag.continue_shopping_hint")}
              </p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-muted/10 rounded-lg overflow-hidden flex-shrink-0">
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
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-light text-muted-foreground">
                            {item.categoryName || (language === "bn" ? "স্কিনকেয়ার" : "Skincare")}
                          </p>
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {language === "bn" && item.nameBn ? item.nameBn : item.name}
                          </h3>
                        </div>
                        <p className="text-sm font-light text-foreground whitespace-nowrap">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-muted/50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-2 text-sm font-light min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-muted/50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal and checkout */}
              <div className="border-t border-border pt-6 pb-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-foreground">{t("bag.subtotal")}</span>
                  <span className="text-sm font-medium text-foreground">{formatPrice(subtotal)}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("bag.shipping_note")}
                </p>

                <Button
                  asChild
                  className="w-full rounded-none"
                  size="lg"
                  onClick={onClose}
                >
                  <Link to="/checkout">
                    {t("bag.checkout")}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-none"
                  size="lg"
                  onClick={onClose}
                  asChild
                >
                  <Link to="/category/skincare">
                    {t("bag.continue")}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingBag;
