import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar, { FilterState } from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import CategoryPagination from "../components/category/CategoryPagination";
import { useCategoryProducts, useCategoryBySlug } from "@/hooks/useCategoryProducts";
import { useSettings } from "@/contexts/SettingsContext";

const Category = () => {
  const { category } = useParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    skinType: null,
  });
  const { language } = useSettings();

  // Reset page when category or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, filters]);

  const { data: categoryData } = useCategoryBySlug(category || "all");
  const { data, isLoading } = useCategoryProducts({
    categorySlug: category,
    sortBy,
    page: currentPage,
    pageSize: 12,
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

  const categoryName = categoryData?.name || 
    (category ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ') : 
    (language === 'bn' ? 'সকল পণ্য' : 'All Products'));

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

export default Category;
