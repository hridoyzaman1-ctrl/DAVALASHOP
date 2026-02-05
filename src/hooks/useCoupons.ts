import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CouponType = 'global' | 'category' | 'product';

export interface Coupon {
    id: string;
    code: string;
    discount_percent: number;
    coupon_type: CouponType;
    target_id: string | null;
    is_active: boolean;
    created_at: string;
}

export interface CouponInput {
    code: string;
    discount_percent: number;
    coupon_type: CouponType;
    target_id: string | null;
    is_active?: boolean;
}

// Fetch all coupons (for Admin)
// Fetch all coupons (for Admin)
export const useCoupons = () => {
    return useQuery({
        queryKey: ["coupons"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("coupons" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as any as Coupon[];
        },
    });
};

// Fetch active coupons (for Banner/Public)
export const useActiveCoupons = () => {
    return useQuery({
        queryKey: ["coupons", "active"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("coupons" as any)
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as any as Coupon[];
        },
    });
};

// Create a new coupon
export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (coupon: CouponInput) => {
            const { data, error } = await supabase
                .from("coupons" as any)
                .insert(coupon)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

// Update a coupon
export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<CouponInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("coupons" as any)
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

// Delete a coupon
export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("coupons" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
        },
    });
};

// Validate a coupon functionality
// Kept as a standalone function to be called on demand, avoiding hook overhead if just clicking "Apply"
export const validateCoupon = async (code: string): Promise<Coupon | null> => {
    const { data, error } = await supabase
        .from("coupons" as any)
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        console.error("Error validating coupon:", error);
        return null;
    }
    return data as any as Coupon | null;
};
