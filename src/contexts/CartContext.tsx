import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string; // This is product_id
  name: string;
  nameBn?: string;
  price: number;
  image: string;
  quantity: number;
  categoryName?: string;
  categoryId?: string; // Category ID for sale calculations
  cartItemId?: string; // ID from cart_items table
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<boolean>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'davala-cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Initial load from local storage for guests
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse cart from local storage", e);
        }
      }
      setIsLoading(false);
    }
  }, [user]);

  // Sync to local storage for guests
  useEffect(() => {
    if (!user && !isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user, isLoading]);

  // Fetch from Supabase for logged-in users
  useEffect(() => {
    let mounted = true;

    async function fetchCart() {
      if (!user) return;

      setIsLoading(true);
      try {
        // 1. Get or create cart
        let { data: cart } = await supabase
          .from('carts' as any)
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!cart) {
          // Use upsert instead of insert to handle race conditions (e.g. multiple tabs or rapid re-renders)
          const { data: newCart, error } = await supabase
            .from('carts' as any)
            .upsert({ user_id: user.id }, { onConflict: 'user_id' })
            .select()
            .single();

          if (error) throw error;
          cart = newCart;
        }

        // 2. Local Storage Merge (if any items exist purely in local state before this fetch)
        const localSaved = localStorage.getItem(CART_STORAGE_KEY);
        const localItems: CartItem[] = localSaved ? JSON.parse(localSaved) : [];

        if (localItems.length > 0) {
          console.log("Merging local cart to server...");
          for (const item of localItems) {
            await supabase.from('cart_items' as any).upsert({
              cart_id: cart.id,
              product_id: item.id,
              quantity: item.quantity
            }, { onConflict: 'cart_id, product_id' });
          }
          // Clear local storage after merge
          localStorage.removeItem(CART_STORAGE_KEY);
        }

        // 3. Fetch Items
        const { data: cartItems, error: itemsError } = await supabase
          .from('cart_items' as any)
          .select(`
            id,
            quantity,
            product_id,
            products (
              name,
              price,
              image_url,
              category_id,
              categories (
                name
              )
            )
          `)
          .eq('cart_id', cart.id);

        if (itemsError) throw itemsError;

        if (mounted && cartItems) {
          const mappedItems: CartItem[] = cartItems.map((item: any) => ({
            id: item.product_id,
            cartItemId: item.id,
            name: item.products?.name || 'Unknown Product',
            price: item.products?.price || 0,
            image: item.products?.image_url || '',
            quantity: item.quantity,
            categoryName: item.products?.categories?.name || '',
            categoryId: item.products?.category_id || undefined
          }));
          setItems(mappedItems);
        }

      } catch (error) {
        if (!mounted) return;

        // Check if session is still valid. If not, this is likely a logout race condition.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Suppressing cart error due to missing session (likely logout)");
          return;
        }

        console.error('Error fetching cart:', error);
        // Only show toast for non-abort errors
        toast({
          title: "Error loading cart",
          description: "Could not load your shopping bag.",
          variant: "destructive"
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchCart();

    return () => {
      mounted = false;
    };
  }, [user, toast]);

  const addItem = async (newItem: Omit<CartItem, 'quantity'>): Promise<boolean> => {
    // ENFORCED LOGIN CHECK
    // ALLOW GUEST CART
    // if (!user) ... check removed

    // Optimistic update
    setItems(current => {
      const existing = current.find(item => item.id === newItem.id);
      if (existing) {
        return current.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...newItem, quantity: 1 }];
    });

    try {
      // Get cart ID (we assume it exists from useEffect, but safe to check)
      const { data: cart } = await supabase
        .from('carts' as any)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cart) {
        // Check if item exists to increment or insert
        // Actually upsert is easier if we know the quantity, but here we just incremented locally.
        // Let's fetch the current qty or just use the local state calculation?
        // Using local state calculation is risky if race conditions.
        // Better: SQL upsert with increment? Supabase doesn't support atomic increment easily via client w/o rpc.
        // We will use the optimistic value we just set.

        // Re-calculate quantity from state? 
        // Accessing 'items' inside async might be stale, but we can't easily access 'current' from setState here.
        // We'll just fetch-check-update or Upsert.
        // Simplest for now: Upsert with fixed quantity is safer if we knew it.
        // Let's rely on the fact that we just added 1.

        // We need to know if it was existing.
        const { data: existingItem } = await supabase
          .from('cart_items' as any)
          .select('quantity, id')
          .eq('cart_id', cart.id)
          .eq('product_id', newItem.id)
          .maybeSingle();

        const nextQty = existingItem ? existingItem.quantity + 1 : 1;

        const { error } = await supabase
          .from('cart_items' as any)
          .upsert({
            cart_id: cart.id,
            product_id: newItem.id,
            quantity: nextQty,
            id: existingItem?.id // Include ID to update if exists
          });

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error("Error adding item to DB cart", error);
      return true; // Still return true since optimistic update was applied
    }
  };

  const removeItem = async (id: string) => {
    setItems(current => current.filter(item => item.id !== id));

    if (user) {
      try {
        const { data: cart } = await supabase
          .from('carts' as any)
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cart) {
          await supabase
            .from('cart_items' as any)
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', id);
        }
      } catch (error) {
        console.error("Error removing item from DB cart", error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    if (user) {
      try {
        const { data: cart } = await supabase
          .from('carts' as any)
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cart) {
          // We need the cart_item_id or just query by product_id
          await supabase
            .from('cart_items' as any)
            .update({ quantity })
            .eq('cart_id', cart.id)
            .eq('product_id', id);
        }
      } catch (error) {
        console.error("Error updating qty in DB cart", error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        const { data: cart } = await supabase
          .from('carts' as any)
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cart) {
          await supabase
            .from('cart_items' as any)
            .delete()
            .eq('cart_id', cart.id);
        }
      } catch (error) {
        console.error("Error clearing DB cart", error);
      }
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
