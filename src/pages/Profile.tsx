import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/useProfile";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, User, Save, Trash2 } from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    mobile: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        address: profile.address || "",
        mobile: profile.mobile || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light">My Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    disabled={uploadAvatar.isPending}
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  {profile?.avatar_url && (
                    <button
                      onClick={() => deleteAvatar.mutate()}
                      className="absolute bottom-0 left-0 p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                      disabled={deleteAvatar.isPending}
                      title="Remove profile picture"
                    >
                      {deleteAvatar.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order History Section */}
          <div className="mt-8">
            <h2 className="text-xl font-light mb-4">Order History</h2>
            <OrderHistory />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Internal Order History Component to keep code organized
import { useMyOrders, Order, OrderItem } from "@/hooks/useOrders";
import { useSettings } from "@/contexts/SettingsContext";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Package, CheckCircle2, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";

const OrderHistory = () => {
  const { data: orders, isLoading } = useMyOrders();
  const { language, formatPrice } = useSettings();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const statusColors: Record<Order['status'], string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<Order['status'], { en: string; bn: string }> = {
    pending: { en: "Pending", bn: "অপেক্ষমান" },
    confirmed: { en: "Confirmed", bn: "নিশ্চিত" },
    processing: { en: "Processing", bn: "প্রক্রিয়াকরণ" },
    shipped: { en: "Shipped", bn: "প্রেরিত" },
    delivered: { en: "Delivered", bn: "বিতরণ" },
    cancelled: { en: "Cancelled", bn: "বাতিল" },
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">{language === 'bn' ? "লোড হচ্ছে..." : "Loading..."}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mb-4 opacity-20" />
          <p>{language === 'bn' ? "কোন অর্ডার পাওয়া যায়নি" : "No orders found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        // Get items from order_items (Supabase naming)
        const orderItems = (order as any).order_items as OrderItem[] || [];
        const isExpanded = expandedOrders.has(order.id);

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Order Header - Clickable to expand */}
              <div
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleOrder(order.id)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                    <Badge className={`font-normal ${statusColors[order.status]} flex items-center gap-1`}>
                      {order.status === 'delivered' && <CheckCircle2 className="h-3 w-3" />}
                      {language === 'bn' ? statusLabels[order.status].bn : statusLabels[order.status].en}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-lg">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {orderItems.length} {language === 'bn' ? "আইটেম" : "items"}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Order Items */}
              {isExpanded && (
                <div className="border-t border-border">
                  {orderItems.length > 0 ? (
                    <div className="divide-y divide-border">
                      {orderItems.map((item) => (
                        <div key={item.id} className="p-4 sm:px-6 flex items-center gap-4">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.unit_price)} × {item.quantity}
                            </p>
                          </div>
                          {/* Item Total */}
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.total_price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      {language === 'bn' ? "আইটেম বিবরণ উপলব্ধ নয়" : "Item details not available"}
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-muted/30 px-4 py-3 sm:px-6 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'bn' ? "সাবটোটাল" : "Subtotal"}</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'bn' ? "ডেলিভারি" : "Delivery"}</span>
                      <span>{formatPrice(order.delivery_price)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                      <span>{language === 'bn' ? "মোট" : "Total"}</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details if available */}
              {(order.payment_status && order.payment_status !== 'pending') && (
                <div className="bg-muted/30 px-4 py-2 sm:px-6 flex justify-between items-center text-sm border-t border-border">
                  <span className="text-muted-foreground">
                    {language === 'bn' ? "পেমেন্ট:" : "Payment:"} <span className="capitalize font-medium text-foreground">{order.payment_status}</span>
                  </span>
                  {order.payment_details && (
                    <span className="text-xs text-muted-foreground max-w-[200px] truncate" title={order.payment_details}>
                      {order.payment_details}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Profile;
