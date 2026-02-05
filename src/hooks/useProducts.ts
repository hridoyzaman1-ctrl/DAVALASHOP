import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  name_bn: string | null;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  image_url: string | null;
  gallery_urls: string[];
  is_new: boolean;
  is_active: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  stock_quantity: number;
  sku: string | null;
  volume_size: string | null;
  ingredients: string | null;
  skin_type: string | null;
  shade_range: string[];
  finish_type: string | null;
  coverage: string | null;
  benefits: string[];
  how_to_use: string | null;
  editors_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  image_url?: string;
  gallery_urls?: string[];
  is_new?: boolean;
  is_active?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  stock_quantity?: number;
  sku?: string;
  volume_size?: string;
  ingredients?: string;
  skin_type?: string;
  shade_range?: string[];
  finish_type?: string;
  coverage?: string;
  benefits?: string[];
  how_to_use?: string;
  editors_note?: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Product & { categories: { name: string } | null })[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as (Product & { categories: { name: string } | null }) | null;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<ProductInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, delete any cart_items referencing this product
      await supabase
        .from("cart_items")
        .delete()
        .eq("product_id", id);

      // Then delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete product error:", error);
        throw new Error(error.message || "Failed to delete product");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
    },
  });
};
