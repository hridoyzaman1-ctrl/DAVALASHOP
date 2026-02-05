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
import { useSales, useCreateSale, useUpdateSale, useDeleteSale, SaleType } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash, Edit, Zap, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

const AdminSales = () => {
    const { data: sales, isLoading } = useSales();
    const createSale = useCreateSale();
    const updateSale = useUpdateSale();
    const deleteSale = useDeleteSale();
    const { toast } = useToast();

    const { data: products } = useProducts();
    const { data: categories } = useCategories();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        discount_percent: 10,
        sale_type: "global" as SaleType,
        target_id: "null",
        start_time: "", // We will init this to current ISO string or empty
        end_time: "",
        is_active: true,
    });

    // Reset Form
    const resetForm = () => {
        // Default start time to now, end time to empty (manual)
        const now = new Date();
        // Adjust for local timezone input needing YYYY-MM-DDThh:mm
        const toLocalISO = (date: Date) => {
            const pad = (n: number) => n < 10 ? '0' + n : n;
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
        };

        setFormData({
            title: "",
            discount_percent: 10,
            sale_type: "global",
            target_id: "null",
            start_time: toLocalISO(now),
            end_time: "",
            is_active: true,
        });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                target_id: formData.target_id === "null" ? null : formData.target_id,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
            };

            if (editingId) {
                await updateSale.mutateAsync({ id: editingId, ...payload });
                toast({ title: "Sale updated successfully" });
            } else {
                await createSale.mutateAsync(payload);
                toast({ title: "Sale created successfully" });
            }
            setIsCreateOpen(false);
            resetForm();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "Failed to save sale",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (sale: any) => {
        // Convert ISO back to local input format
        const toLocalInput = (isoString: string) => {
            if (!isoString) return "";
            const date = new Date(isoString);
            const pad = (n: number) => n < 10 ? '0' + n : n;
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
        };

        setFormData({
            title: sale.title || "",
            discount_percent: sale.discount_percent,
            sale_type: sale.sale_type,
            target_id: sale.target_id || "null",
            start_time: toLocalInput(sale.start_time),
            end_time: toLocalInput(sale.end_time),
            is_active: sale.is_active,
        });
        setEditingId(sale.id);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this sale?")) {
            try {
                await deleteSale.mutateAsync(id);
                toast({ title: "Sale deleted" });
            } catch (error: any) {
                toast({
                    title: "Error deleting",
                    description: error.message || "Could not delete sale.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleToggleActive = async (id: string, currentState: boolean) => {
        try {
            await updateSale.mutateAsync({ id, is_active: !currentState });
            toast({ title: `Sale ${!currentState ? 'activated' : 'deactivated'}` });
        } catch (error) {
            toast({ title: "Error updating status", variant: "destructive" });
        }
    };

    // Helper to get target name
    const getTargetName = (type: string, id: string | null) => {
        if (!id) return "All Products";
        if (type === 'category') return categories?.find((c: any) => c.id === id)?.name || id;
        if (type === 'product') return products?.find((p: any) => p.id === id)?.name || id;
        return "-";
    };

    return (
        <AdminLayout title="Flash Sales">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Manage Flash Sales</h2>
                        <p className="text-muted-foreground">Schedule sales with countdown timers.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); else if (!editingId) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Sale
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Sale" : "Create New Sale"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Sale Title (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Summer Flash Sale"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Discount Percentage (%)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={isNaN(formData.discount_percent) ? "" : formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Sale Scope</Label>
                                    <Select
                                        value={formData.sale_type}
                                        onValueChange={(val: SaleType) => setFormData({ ...formData, sale_type: val, target_id: "null" })}
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

                                {formData.sale_type === 'category' && (
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

                                {formData.sale_type === 'product' && (
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time (Optional)</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Leave empty for indefinite sale.</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is-active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is-active">Active</Label>
                                </div>

                                <Button onClick={handleSubmit} className="w-full">
                                    {editingId ? "Update Sale" : "Start Sale"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-background rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales?.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-medium">{sale.title || "Flash Sale"}</TableCell>
                                    <TableCell>{sale.discount_percent}%</TableCell>
                                    <TableCell className="capitalize">{sale.sale_type}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{getTargetName(sale.sale_type, sale.target_id)}</TableCell>
                                    <TableCell className="text-xs">
                                        <div>Start: {format(new Date(sale.start_time), "MMM d, HH:mm")}</div>
                                        {sale.end_time ? (
                                            <div>End: {format(new Date(sale.end_time), "MMM d, HH:mm")}</div>
                                        ) : (
                                            <div className="text-muted-foreground italic">Indefinite</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={sale.is_active}
                                            onCheckedChange={() => handleToggleActive(sale.id, sale.is_active)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(sale.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!sales || sales.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No active sales. Create one to get started.
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

export default AdminSales;
