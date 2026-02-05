import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProduct, useCreateProduct, useUpdateProduct, ProductInput } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditing = id && id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(isEditing ? id : "");
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    compare_at_price: undefined,
    category_id: undefined,
    image_url: "",
    is_new: false,
    is_active: true,
    is_new_arrival: false,
    is_best_seller: false,
    stock_quantity: 0,
    sku: "",
    volume_size: "",
    ingredients: "",
    skin_type: "",
    shade_range: [],
    finish_type: "",
    coverage: "",
    benefits: [],
    how_to_use: "",
    editors_note: "",
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        slug: existingProduct.slug,
        description: existingProduct.description || "",
        short_description: existingProduct.short_description || "",
        price: existingProduct.price,
        compare_at_price: existingProduct.compare_at_price || undefined,
        category_id: existingProduct.category_id || undefined,
        image_url: existingProduct.image_url || "",
        is_new: existingProduct.is_new,
        is_active: existingProduct.is_active,
        is_new_arrival: existingProduct.is_new_arrival || false,
        is_best_seller: existingProduct.is_best_seller || false,
        stock_quantity: existingProduct.stock_quantity,
        sku: existingProduct.sku || "",
        volume_size: existingProduct.volume_size || "",
        ingredients: existingProduct.ingredients || "",
        skin_type: existingProduct.skin_type || "",
        shade_range: existingProduct.shade_range || [],
        finish_type: existingProduct.finish_type || "",
        coverage: existingProduct.coverage || "",
        benefits: existingProduct.benefits || [],
        how_to_use: existingProduct.how_to_use || "",
        editors_note: existingProduct.editors_note || "",
      });
    }
  }, [existingProduct]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id, ...formData });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync(formData);
        toast({ title: "Product created successfully" });
      }
      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <AdminLayout title="Loading...">
        <div className="text-muted-foreground">Loading product...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Edit Product" : "New Product"}>
      <div className="max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/admin/products")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-background p-6 rounded-lg border border-border space-y-6">
            <h2 className="text-lg font-medium text-foreground">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Brief product summary"
              />
            </div>

            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (৳) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Compare at Price (৳)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price || ""}
                  onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category_id || ""}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="space-y-3">
                {/* Image Preview */}
                {formData.image_url && (
                  <div className="relative w-32 h-32 border rounded overflow-hidden">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {/* Upload Button */}
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}.${fileExt}`;
                        const { error: uploadError } = await supabase.storage
                          .from('product-images')
                          .upload(fileName, file);
                        if (uploadError) throw uploadError;
                        const { data: { publicUrl } } = supabase.storage
                          .from('product-images')
                          .getPublicUrl(fileName);
                        setFormData({ ...formData, image_url: publicUrl });
                        toast({ title: "Image uploaded successfully" });
                      } catch (err: any) {
                        toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                      }
                    }}
                    className="max-w-xs"
                  />
                  <span className="text-sm text-muted-foreground">or</span>
                </div>
                {/* URL Input */}
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Paste image URL here..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked === true })}
                />
                <Label htmlFor="is_new">Mark as New</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
                />
                <Label htmlFor="is_active">Active (visible on store)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_new_arrival"
                  checked={formData.is_new_arrival || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new_arrival: checked === true })}
                />
                <Label htmlFor="is_new_arrival" className="text-primary font-medium">New Arrival Collection</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_best_seller"
                  checked={formData.is_best_seller || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_best_seller: checked === true })}
                />
                <Label htmlFor="is_best_seller" className="text-primary font-medium">Best Seller Collection</Label>
              </div>
            </div>
          </div>

          {/* Cosmetics Details */}
          <div className="bg-background p-6 rounded-lg border border-border space-y-6">
            <h2 className="text-lg font-medium text-foreground">Cosmetics Details</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Volume/Size</Label>
                <Input
                  value={formData.volume_size}
                  onChange={(e) => setFormData({ ...formData, volume_size: e.target.value })}
                  placeholder="e.g., 30ml, 50g"
                />
              </div>
              <div className="space-y-2">
                <Label>Skin Type</Label>
                <Select
                  value={formData.skin_type || ""}
                  onValueChange={(value) => setFormData({ ...formData, skin_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skin type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skin Types</SelectItem>
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="oily">Oily</SelectItem>
                    <SelectItem value="combination">Combination</SelectItem>
                    <SelectItem value="sensitive">Sensitive</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Finish Type</Label>
                <Select
                  value={formData.finish_type || ""}
                  onValueChange={(value) => setFormData({ ...formData, finish_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matte">Matte</SelectItem>
                    <SelectItem value="dewy">Dewy</SelectItem>
                    <SelectItem value="satin">Satin</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="shimmer">Shimmer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Coverage (for makeup products)</Label>
              <Select
                value={formData.coverage || ""}
                onValueChange={(value) => setFormData({ ...formData, coverage: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="buildable">Buildable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ingredients</Label>
              <Textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                rows={3}
                placeholder="List key ingredients..."
              />
            </div>

            <div className="space-y-2">
              <Label>How to Use</Label>
              <Textarea
                value={formData.how_to_use}
                onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                rows={3}
                placeholder="Application instructions..."
              />
            </div>

            <div className="space-y-2">
              <Label>Editor's Note</Label>
              <Textarea
                value={formData.editors_note}
                onChange={(e) => setFormData({ ...formData, editors_note: e.target.value })}
                rows={2}
                placeholder="A personal recommendation or tip..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
