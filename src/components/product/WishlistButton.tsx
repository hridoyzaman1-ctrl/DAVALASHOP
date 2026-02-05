import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  onAuthRequired?: () => void;
  variant?: "icon" | "button";
  className?: string;
}

const WishlistButton = ({ productId, onAuthRequired, variant = "icon", className }: WishlistButtonProps) => {
  const { user } = useAuth();
  const { language } = useSettings();
  const { data: isInWishlist } = useIsInWishlist(productId);
  const { toggle, isPending } = useToggleWishlist();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      onAuthRequired?.();
      return;
    }
    
    try {
      await toggle(productId, isInWishlist || false);
      toast.success(
        isInWishlist 
          ? (language === 'bn' ? 'ফেভারিট থেকে সরানো হয়েছে' : 'Removed from favorites')
          : (language === 'bn' ? 'ফেভারিটে যোগ করা হয়েছে' : 'Added to favorites')
      );
    } catch (error) {
      toast.error(language === 'bn' ? 'সমস্যা হয়েছে' : 'Something went wrong');
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className={cn("rounded-none gap-2", className)}
      >
        <Heart className={cn("h-4 w-4", isInWishlist && "fill-primary text-primary")} />
        {isInWishlist 
          ? (language === 'bn' ? 'ফেভারিটে আছে' : 'In Favorites')
          : (language === 'bn' ? 'ফেভারিটে যোগ করুন' : 'Add to Favorites')}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors",
        isPending && "opacity-50",
        className
      )}
      aria-label={isInWishlist ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-colors",
          isInWishlist ? "fill-primary text-primary" : "text-foreground"
        )} 
      />
    </button>
  );
};

export default WishlistButton;
