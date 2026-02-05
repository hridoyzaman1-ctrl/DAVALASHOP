import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  category_name: string | null;
}

interface ProductSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductSearch = ({ isOpen, onClose }: ProductSearchProps) => {
  const { t, language, formatPrice } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const popularSearches = language === "bn"
    ? ["ভিটামিন সি", "ময়েশ্চারাইজার", "সানস্ক্রিন", "ফেস মাস্ক", "লিপ কেয়ার"]
    : ["Vitamin C", "Moisturizer", "Sunscreen", "Face Mask", "Lip Care"];

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, price, image_url, categories(name)")
          .eq("is_active", true)
          .ilike("name", `%${query}%`)
          .limit(8);

        if (error) throw error;

        setResults(
          data.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image_url: product.image_url,
            category_name: product.categories?.name || null,
          }))
        );
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for click-outside */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Container - Fixed at top, Higher Z-index than nav */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-[100] shadow-lg animate-in slide-in-from-top-2 duration-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="max-w-4xl mx-auto relative">

            {/* Header Row: Search Input + Close Button */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative flex items-center bg-muted/30 rounded-full px-4 py-2 border border-transparent focus-within:border-primary/50 focus-within:bg-background transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-muted-foreground mr-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search.products_placeholder")}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Big Close Button */}
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-muted"
                aria-label="Close search"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results Area */}
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="space-y-4 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasSearched && results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {t("search.no_results")} "{searchQuery}"
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3 py-2">
                  <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-3">
                    {t("search.results")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border group"
                      >
                        <div className="w-14 h-14 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {product.category_name || t("product.general")}
                          </p>
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-4">
                    {t("search.popular")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="text-foreground hover:text-primary hover:bg-primary/5 text-sm font-light py-1.5 px-3 border border-border rounded-full transition-all duration-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProductSearch;
