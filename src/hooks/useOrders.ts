import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: 'dhaka' | 'outside_dhaka';
  delivery_price: number;
  subtotal: number;
  total: number;
  discount?: number;
  coupon_code?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string | null;
  admin_notes: string | null;
  payment_status: string | null;
  payment_method: string | null;
  payment_details: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  profiles?: {
    full_name: string | null;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderInput {
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: 'dhaka' | 'outside_dhaka';
  delivery_price: number;
  subtotal: number;
  total: number;
  discount?: number;
  coupon_code?: string;
  payment_method?: string;
  notes?: string;
}

export interface OrderItemInput {
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      // Simplified query - no join to profiles to avoid RLS issues
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching orders:", error);
        throw error;
      }
      return data as Order[];
    },
  });
};

// Hook for customers to see only their own orders
export const useMyOrders = () => {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return [] as Order[];
      }

      const { data, error } = await supabase
        .from("orders" as any)
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching my orders:", error);
        throw error;
      }
      return data as any as Order[];
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      // Simplified query - no join to profiles
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) return null;

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) throw itemsError;

      return { ...order, items } as Order;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ order, items, id }: { order: OrderInput; items: Omit<OrderItemInput, 'order_id'>[]; id?: string }) => {
      console.log("Creating order with:", { order, items, id });

      // Create the order
      // For guests, we might not get the data back if RLS blocks SELECT.
      // So we prepare the data to return manually if needed.
      const orderData = {
        ...order,
        id: id, // Use client-provided ID if available (crucial for guests)
        total_amount: order.total
      };

      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .maybeSingle(); // Use maybeSingle to avoid error if RLS blocks return

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      console.log("Order created:", createdOrder);

      // Use the returned ID or the one we sent
      const finalOrderId = createdOrder?.id || id;

      if (!finalOrderId) {
        throw new Error("Failed to retrieve Order ID");
      }

      // Create order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: finalOrderId,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw itemsError;
      }

      // Return actual data if valid, otherwise constructed data
      return createdOrder || { ...orderData, id: finalOrderId } as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order['status'] }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      console.log("Updating order:", id, "with:", updates);

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
