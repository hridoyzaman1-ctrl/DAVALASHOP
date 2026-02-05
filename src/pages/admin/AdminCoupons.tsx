import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, CouponType } from "@/hooks/useCoupons";
import { useProducts } from "@/hooks/useProducts"; // Assuming this exists to pick products
import { useCategories } from "@/hooks/useCategories"; // Assuming this exists
import { useToast } from "@/components/ui/use-toast"; // Correct path for toast
import { Plus, Trash, Edit, Save, X, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminCoupons = () => {
    const { data: coupons, isLoading } = useCoupons();
    const createCoupon = useCreateCoupon();
    const updateCoupon = useUpdateCoupon();
    const deleteCoupon = useDeleteCoupon();
    const { toast } = useToast();

    const { data: products } = useProducts();
    const { data: categories } = useCategories(); // Assuming this hook exists or similar

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        discount_percent: 10,
        coupon_type: "global" as CouponType,
        target_id: "null", // String "null" to handle select value easily
        is_active: true,
    });

    const resetForm = () => {
        setFormData({
            code: "",
            discount_percent: 10,
            coupon_type: "global",
            target_id: "null",
            is_active: true,
        });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                target_id: formData.target_id === "null" ? null : formData.target_id
            };

            if (editingId) {
                await updateCoupon.mutateAsync({ id: editingId, ...payload });
                toast({ title: "Coupon updated successfully" });
            } else {
                await createCoupon.mutateAsync(payload);
                toast({ title: "Coupon created successfully" });
            }
            setIsCreateOpen(false);
            resetForm();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save coupon",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (coupon: any) => {
        setFormData({
            code: coupon.code,
            discount_percent: coupon.discount_percent,
            coupon_type: coupon.coupon_type,
            target_id: coupon.target_id || "null",
            is_active: coupon.is_active,
        });
        setEditingId(coupon.id);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            try {
                await deleteCoupon.mutateAsync(id);
                toast({ title: "Coupon deleted" });
            } catch (error: any) {
                console.error("Delete failed:", error);
                toast({
                    title: "Error deleting",
                    description: error.message || "Could not delete coupon. It might be used in an existing order.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleToggleActive = async (id: string, currentState: boolean) => {
        try {
            await updateCoupon.mutateAsync({ id, is_active: !currentState });
            toast({ title: `Coupon ${!currentState ? 'activated' : 'deactivated'}` });
        } catch (error) {
            toast({ title: "Error updating status", variant: "destructive" });
        }
    };

    // Helper to get target name
    const getTargetName = (type: string, id: string | null) => {
        if (!id) return "-";
        if (type === 'category') return categories?.find((c: any) => c.id === id)?.name || id;
        if (type === 'product') return products?.find((p: any) => p.id === id)?.name || id;
        return "-";
    };

    return (
        <AdminLayout title="Coupons">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Manage Coupons</h2>
                        <p className="text-muted-foreground">Create and manage discount codes for your store.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Coupon Code</Label>
                                    <Input
                                        placeholder="e.g. SUMMER20"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Discount Percentage (%)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Coupon Type</Label>
                                    <Select
                                        value={formData.coupon_type}
                                        onValueChange={(val: CouponType) => setFormData({ ...formData, coupon_type: val, target_id: "null" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="global">Global (All Products)</SelectItem>
                                            <SelectItem value="category">Specific Category</SelectItem>
                                            <SelectItem value="product">Specific Product</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.coupon_type === 'category' && (
                                    <div className="space-y-2">
                                        <Label>Select Category</Label>
                                        <Select
                                            value={formData.target_id}
                                            onValueChange={(val) => setFormData({ ...formData, target_id: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {formData.coupon_type === 'product' && (
                                    <div className="space-y-2">
                                        <Label>Select Product</Label>
                                        <Select
                                            value={formData.target_id}
                                            onValueChange={(val) => setFormData({ ...formData, target_id: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products?.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is-active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is-active">Active</Label>
                                </div>

                                <Button onClick={handleSubmit} className="w-full">
                                    {editingId ? "Update Coupon" : "Create Coupon"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-background rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons?.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium font-mono">{coupon.code}</TableCell>
                                    <TableCell>{coupon.discount_percent}%</TableCell>
                                    <TableCell className="capitalize">{coupon.coupon_type}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{getTargetName(coupon.coupon_type, coupon.target_id)}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={coupon.is_active}
                                            onCheckedChange={() => handleToggleActive(coupon.id, coupon.is_active)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(coupon.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!coupons || coupons.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No coupons found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCoupons;
