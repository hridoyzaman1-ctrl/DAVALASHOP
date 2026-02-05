import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    name_bn: string | null;
    price: number;
    image_url: string | null;
    slug: string;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          products (
            id,
            name,
            name_bn,
            price,
            image_url,
            slug
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });
};

export const useIsInWishlist = (productId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wishlist", user?.id, productId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.setQueryData(["wishlist", user?.id, productId], true);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.setQueryData(["wishlist", user?.id, productId], false);
    },
  });
};

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useToggleWishlist = () => {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  return {
    toggle: async (productId: string, isInWishlist: boolean) => {
      // ENFORCED LOGIN CHECK
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to manage your wishlist.",
          variant: "destructive",
        });
        navigate("/auth", { state: { returnTo: window.location.pathname } });
        return;
      }

      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(productId);
      } else {
        await addToWishlist.mutateAsync(productId);
      }
    },
    isPending: addToWishlist.isPending || removeFromWishlist.isPending,
  };
};
