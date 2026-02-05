import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SaleType = 'global' | 'category' | 'product';

export interface ActiveSale {
    id: string;
    title?: string;
    sale_type: SaleType;
    target_id: string | null;
    discount_percent: number;
    start_time: string; // ISO String
    end_time: string | null; // ISO String
    is_active: boolean;
    created_at: string;
}

export interface SaleInput {
    title?: string;
    sale_type: SaleType;
    target_id: string | null;
    discount_percent: number;
    start_time?: string;
    end_time?: string | null;
    is_active?: boolean;
}

// Fetch all sales (for Admin)
export const useSales = () => {
    return useQuery({
        queryKey: ["sales"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("active_sales" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as any as ActiveSale[];
        },
    });
};

// Fetch currently active sales (For Frontend)
export const useActiveSales = () => {
    return useQuery({
        queryKey: ["sales", "active"],
        queryFn: async () => {
            // We fetch all "active" flag sales and filter active by time in frontend/hook
            // strictly speaking, we could filter by time in SQL `end_time > now()`
            const { data, error } = await supabase
                .from("active_sales" as any)
                .select("*")
                .eq("is_active", true);

            if (error) throw error;

            const now = new Date();
            const validSales = (data as any as ActiveSale[]).filter(sale => {
                const start = new Date(sale.start_time);
                const end = sale.end_time ? new Date(sale.end_time) : null;
                return start <= now && (!end || end > now);
            });

            return validSales;
        },
        // Refresh every minute to check for expired sales?
        refetchInterval: 60000
    });
};

// Create a new sale
export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sale: SaleInput) => {
            const { data, error } = await supabase
                .from("active_sales" as any)
                .insert(sale)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
        },
    });
};

// Update a sale
export const useUpdateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<SaleInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("active_sales" as any)
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
        },
    });
};

// Delete a sale
export const useDeleteSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("active_sales" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
        },
    });
};
