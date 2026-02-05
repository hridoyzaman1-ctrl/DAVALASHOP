import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "./useProducts";
import { FilterState } from "@/components/category/FilterSortBar";

export interface CategoryProductsParams {
  categorySlug?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
  filters?: FilterState;
}

export interface CategoryProductsResult {
  products: (Product & { categories: { name: string } | null })[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const useCategoryProducts = ({
  categorySlug,
  sortBy = "featured",
  page = 1,
  pageSize = 12,
  filters,
}: CategoryProductsParams) => {
  return useQuery({
    queryKey: ["categoryProducts", categorySlug, sortBy, page, pageSize, filters],
    queryFn: async (): Promise<CategoryProductsResult> => {
      // First get the category ID if we have a slug
      let categoryId: string | null = null;

      if (categorySlug && categorySlug !== "all" && categorySlug !== "new-arrivals" && categorySlug !== "best-selling") {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .eq("is_active", true)
          .maybeSingle();

        // If slug was provided but category not found, return empty result immediately
        // Do NOT fall back to showing all products
        if (!categoryData) {
          return {
            products: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
          };
        }

        categoryId = categoryData.id;
      }

      // Build the query
      let query = supabase
        .from("products")
        .select("*, categories(name)", { count: "exact" })
        .eq("is_active", true);

      // Handle special collection slugs
      if (categorySlug === "new-arrivals") {
        query = query.eq("is_new_arrival" as any, true);
      } else if (categorySlug === "best-selling") {
        query = query.eq("is_best_seller" as any, true);
      } else if (categoryId) {
        // Filter by category from URL if specified (normal categories)
        query = query.eq("category_id", categoryId);
      }

      // Apply category filters from filter panel (multi-select)
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in("category_id", filters.categories);
      }

      // Apply price range filter
      if (filters?.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (max === '+' || !max) {
          // "2000+" case
          query = query.gte("price", parseInt(min));
        } else {
          query = query.gte("price", parseInt(min)).lte("price", parseInt(max));
        }
      }

      // Apply skin type filter
      if (filters?.skinType) {
        query = query.ilike("skin_type", `%${filters.skinType}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          // Featured - show new items first, then by created_at
          query = query.order("is_new", { ascending: false }).order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        products: data as (Product & { categories: { name: string } | null })[],
        totalCount,
        totalPages,
        currentPage: page,
      };
    },
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["categoryBySlug", slug],
    queryFn: async () => {
      if (!slug || slug === "all") {
        return { id: null, name: "All Products", slug: "all" };
      }

      // Handle special collection slugs
      if (slug === "new-arrivals") {
        return { id: null, name: "New Arrivals", slug: "new-arrivals" };
      }
      if (slug === "best-selling") {
        return { id: null, name: "Best Selling", slug: "best-selling" };
      }

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};
