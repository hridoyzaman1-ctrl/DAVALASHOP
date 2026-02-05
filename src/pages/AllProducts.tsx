import { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar, { FilterState } from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import CategoryPagination from "../components/category/CategoryPagination";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import { useSettings } from "@/contexts/SettingsContext";

const AllProducts = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    skinType: null,
  });
  const { language, t } = useSettings();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const { data, isLoading } = useCategoryProducts({
    categorySlug: undefined, // No category filter - show all products
    sortBy,
    page: currentPage,
    pageSize: 24, // Show more products on all products page
    filters,
  });

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const categoryName = language === 'bn' ? 'সকল পণ্য' : 'All Products';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <CategoryHeader 
          category={categoryName} 
        />
        
        <FilterSortBar 
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={data?.totalCount || 0}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        
        <ProductGrid 
          products={data?.products || []} 
          isLoading={isLoading}
        />
        
        <CategoryPagination 
          currentPage={data?.currentPage || 1}
          totalPages={data?.totalPages || 1}
          onPageChange={handlePageChange}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default AllProducts;
