import { ActiveSale } from "@/hooks/useSales";
import { Product } from "@/hooks/useProducts";

export interface PriceResult {
    originalPrice: number;
    finalPrice: number;
    discountPercent: number;
    isSale: boolean;
    saleEnd?: string | null;
    activeSale?: ActiveSale | null;
}

export const getEffectivePrice = (product: Product & { category_id?: string }, activeSales: ActiveSale[] | undefined): PriceResult => {
    const defaultResult = {
        originalPrice: product.price,
        finalPrice: product.price,
        discountPercent: 0,
        isSale: false,
        saleEnd: null,
        activeSale: null
    };

    if (!activeSales || activeSales.length === 0) return defaultResult;

    // Filter relevant sales
    const relevantSales = activeSales.filter(sale => {
        if (sale.sale_type === 'global') return true;
        if (sale.sale_type === 'category' && product.category_id && sale.target_id === product.category_id) return true;
        if (sale.sale_type === 'product' && sale.target_id === product.id) return true;
        return false;
    });

    if (relevantSales.length === 0) return defaultResult;

    // Prioritize Sales: Product > Category > Global
    // Or just take the highest discount? Usually Specific wins in conflict logic, but let's do Max Discount as it's better for customer.
    // Actually standard e-commerce is Specific overrides Global (even if lower).
    // Let's implement: Product > Category > Global.

    // Sort by priority (Product=3, Category=2, Global=1)
    const priority = (type: string) => {
        if (type === 'product') return 3;
        if (type === 'category') return 2;
        return 1;
    };

    const bestSale = relevantSales.sort((a, b) => priority(b.sale_type) - priority(a.sale_type))[0];

    // Calculate price
    const discount = (product.price * bestSale.discount_percent) / 100;
    const finalPrice = product.price - discount;

    return {
        originalPrice: product.price,
        finalPrice: finalPrice,
        discountPercent: bestSale.discount_percent,
        isSale: true,
        saleEnd: bestSale.end_time,
        activeSale: bestSale
    };
};
