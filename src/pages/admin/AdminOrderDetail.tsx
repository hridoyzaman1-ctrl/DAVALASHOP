import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { useOrder, useUpdateOrderStatus, useUpdateOrderDetails, Order } from "@/hooks/useOrders";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Package, Truck, MapPin, Phone, User, CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<Order['status'], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<Order['status'], { en: string; bn: string }> = {
  pending: { en: "Processing", bn: "প্রক্রিয়াকরণ" },
  confirmed: { en: "Pending", bn: "অপেক্ষমান" },
  processing: { en: "Processing", bn: "প্রক্রিয়াকরণ" },
  shipped: { en: "Shipped", bn: "প্রেরিত" },
  delivered: { en: "Delivered", bn: "বিতরণ" },
  cancelled: { en: "Cancelled", bn: "বাতিল" },
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id || "");
  const updateStatus = useUpdateOrderStatus();
  const updateDetails = useUpdateOrderDetails();
  const { toast } = useToast();
  const { language, formatPrice } = useSettings();

  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.payment_status || "pending");
      setPaymentDetails(order.payment_details || "");
      setAdminNotes(order.admin_notes || "");
    }
  }, [order]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!id) return;

    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "অর্ডার স্ট্যাটাস আপডেট হয়েছে" : "Order status updated",
      });
    } catch (error) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "স্ট্যাটাস আপডেট করতে ব্যর্থ" : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleSaveDetails = async () => {
    if (!id) return;

    try {
      await updateDetails.mutateAsync({
        id,
        updates: {
          payment_status: paymentStatus,
          payment_details: paymentDetails,
          admin_notes: adminNotes
        }
      });
      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "অর্ডার বিবরণ আপডেট হয়েছে" : "Order details updated",
      });
    } catch (error) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "বিবরণ আপডেট করতে ব্যর্থ" : "Failed to update details",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {language === 'bn' ? "অর্ডার পাওয়া যায়নি" : "Order not found"}
          </p>
          <Button onClick={() => navigate("/admin/orders")}>
            {language === 'bn' ? "অর্ডার তালিকায় ফিরুন" : "Back to Orders"}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-light text-foreground">
              {language === 'bn' ? 'অর্ডার বিবরণ' : 'Order Details'}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              #{order.id}
            </p>
          </div>
          {(!['delivered', 'cancelled'].includes(order.status)) && (
            <Button
              onClick={() => handleStatusChange('delivered')}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {language === 'bn' ? 'ডেলিভারড' : 'Mark Delivered'}
            </Button>
          )}
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <Badge className={statusColors[order.status]}>
                {language === 'bn' ? statusLabels[order.status].bn : statusLabels[order.status].en}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {language === 'bn' ? label.bn : label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === 'bn' ? 'গ্রাহক তথ্য' : 'Customer Info'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'নাম' : 'Name'}</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p>{order.customer_phone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p>{order.customer_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Info'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'এলাকা' : 'Area'}</p>
                <p className="font-medium">
                  {order.delivery_area === 'dhaka'
                    ? (language === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka')
                    : (language === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</p>
                <p className="font-medium">{formatPrice(order.delivery_price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === 'bn' ? 'অর্ডার তারিখ' : 'Order Date'}</p>
                <p className="font-medium">{format(new Date(order.created_at), 'dd MMMM yyyy, hh:mm a')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                {language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <p className="text-muted-foreground">{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</p>
                <p>{formatPrice(order.subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">{language === 'bn' ? 'ডেলিভারি' : 'Delivery'}</p>
                <p>{formatPrice(order.delivery_price)}</p>
              </div>
              {(order.discount && order.discount > 0) && (
                <div className="flex justify-between text-green-600">
                  <p>{language === 'bn' ? 'ডিসকাউন্ট' : 'Discount'} {order.coupon_code && `(${order.coupon_code})`}</p>
                  <p>-{formatPrice(order.discount)}</p>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <p className="font-medium">{language === 'bn' ? 'মোট' : 'Total'}</p>
                <p className="font-medium text-lg">{formatPrice(order.total)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {language === 'bn' ? 'অর্ডার আইটেম' : 'Order Items'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment & Admin Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {language === 'bn' ? 'পেমেন্ট ম্যানেজমেন্ট' : 'Payment Management'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</Label>
                <Input
                  value={order.payment_method === 'cod' ? 'Cash On Delivery' :
                    order.payment_method === 'bkash' ? 'bKash' :
                      order.payment_method === 'nagad' ? 'Nagad' :
                        order.payment_method === 'bank' ? 'Bank Transfer' :
                          (order.payment_method || "N/A")}
                  readOnly
                  className="bg-muted font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'পেমেন্ট বিবরণ' : 'Payment Details'}</Label>
                <Textarea
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="e.g., Paid 500tk via Bkash (TrxID: ...)"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveDetails} disabled={updateDetails.isPending}>
                  {updateDetails.isPending ? "Saving..." : "Save Details"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {language === 'bn' ? 'অ্যাডমিন নোট' : 'Admin Notes'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'bn' ? 'অভ্যন্তরীণ নোট' : 'Internal Notes'}</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Private notes for admins only..."
                  className="min-h-[120px]"
                />
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Label className="text-muted-foreground mb-2 block">
                    {language === 'bn' ? 'গ্রাহক নোট' : 'Customer Notes'}
                  </Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{order.notes}</p>
                </div>
              )}
              <div className="flex justify-end mt-2">
                <Button onClick={handleSaveDetails} disabled={updateDetails.isPending} variant="secondary">
                  {updateDetails.isPending ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
