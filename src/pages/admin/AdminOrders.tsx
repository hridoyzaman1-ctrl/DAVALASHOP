import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { useOrders, useUpdateOrderStatus, useDeleteOrder, Order } from "@/hooks/useOrders";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Trash2, Search, CheckCircle2 } from "lucide-react";
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

const ErrorState = ({ error, onRetry, language }: { error: any; onRetry: () => void; language: string }) => (
  <div className="text-center py-12 px-4 border border-destructive/20 bg-destructive/5 rounded-lg">
    <h2 className="text-destructive font-medium mb-2">
      {language === 'bn' ? "অর্ডার লোড করতে সমস্যা হয়েছে" : "Error Loading Orders"}
    </h2>
    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
      {error?.message || "Please check your database permissions."}
    </p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      {language === 'bn' ? "পুনরায় চেষ্টা করুন" : "Try Again"}
    </Button>
  </div>
);

const AdminOrders = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const { toast } = useToast();
  const { language, formatPrice } = useSettings();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredOrders = orders?.filter(order => {
    const matchesSearch =
      (order.customer_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (order.customer_phone || "").includes(search) ||
      (order.id?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteOrder.mutateAsync(deleteId);
      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "অর্ডার মুছে ফেলা হয়েছে" : "Order deleted successfully",
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "অর্ডার মুছতে ব্যর্থ" : "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-light text-foreground">
            {language === 'bn' ? 'অর্ডার ম্যানেজমেন্ট' : 'Order Management'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'bn' ? "অনুসন্ধান করুন..." : "Search orders..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={language === 'bn' ? "স্ট্যাটাস ফিল্টার" : "Filter by status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'bn' ? "সব" : "All"}</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {language === 'bn' ? label.bn : label.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 flex flex-col items-center gap-4 text-muted-foreground bg-muted/20 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            {language === 'bn' ? "অর্ডার লোড হচ্ছে..." : "Loading orders..."}
          </div>
        ) : !orders ? (
          <ErrorState
            error={{ message: "Cannot connect to database. Please check your admin permissions." }}
            onRetry={() => window.location.reload()}
            language={language}
          />
        ) : filteredOrders?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
            {language === 'bn' ? "কোন অর্ডার পাওয়া যায়নি" : "No orders found"}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop View: Table */}
            <div className="hidden lg:block border border-border rounded-lg overflow-hidden bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">{language === 'bn' ? "অর্ডার আইডি" : "ID"}</TableHead>
                    <TableHead>{language === 'bn' ? "গ্রাহক" : "Customer"}</TableHead>
                    <TableHead>{language === 'bn' ? "ঠিকানা ও নোট" : "Address & Notes"}</TableHead>
                    <TableHead>{language === 'bn' ? "মোট" : "Total"}</TableHead>
                    <TableHead>{language === 'bn' ? "স্ট্যাটাস" : "Status"}</TableHead>
                    <TableHead>{language === 'bn' ? "তারিখ" : "Date"}</TableHead>
                    <TableHead className="text-right">{language === 'bn' ? "অ্যাকশন" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <p className="text-xs line-clamp-1" title={order.customer_address}>{order.customer_address}</p>
                        {order.notes && (
                          <p className="text-[10px] text-blue-600 italic mt-1 line-clamp-1">
                            Note: {order.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[120px] h-8 p-0 border-none bg-transparent hover:bg-muted/50">
                            <Badge className={`${statusColors[order.status]} hover:${statusColors[order.status]}`}>
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
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {order.status === 'pending' && (
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleStatusChange(order.id, 'confirmed')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {(['confirmed', 'processing', 'shipped'].includes(order.status)) && (
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50"
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(order.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredOrders?.map((order) => (
                <div key={order.id} className="bg-background border border-border rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-border pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">#{order.id.slice(0, 8)}</span>
                        <Badge className={`${statusColors[order.status]} text-[10px] py-0 px-2`}>
                          {language === 'bn' ? statusLabels[order.status].bn : statusLabels[order.status].en}
                        </Badge>
                      </div>
                      <div className="font-semibold text-base">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">{formatPrice(order.total)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {format(new Date(order.created_at), 'dd MMM, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                    <div className="text-xs leading-relaxed">
                      <span className="text-muted-foreground font-medium">{language === 'bn' ? "ঠিকানা: " : "Address: "}</span>
                      {order.customer_address}
                    </div>
                    {order.notes && (
                      <div className="text-xs text-blue-600 bg-blue-50/50 p-2 rounded border border-blue-100 italic">
                        <span className="font-bold not-italic">Note: </span>{order.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 gap-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-9 px-3 text-xs" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        {language === 'bn' ? "বিস্তারিত" : "Details"}
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-3 text-xs text-destructive hover:bg-destructive/5" onClick={() => setDeleteId(order.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        {language === 'bn' ? "মুছুন" : "Delete"}
                      </Button>
                    </div>

                    <div className="flex-1 flex justify-end">
                      {order.status === 'pending' ? (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-xs"
                          onClick={() => handleStatusChange(order.id, 'confirmed')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          {language === 'bn' ? "কনফার্ম করুন" : "Confirm"}
                        </Button>
                      ) : (['confirmed', 'processing', 'shipped'].includes(order.status)) ? (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 h-9 text-xs"
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          {language === 'bn' ? "ডেলিভারড করুন" : "Deliver"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'bn' ? "আপনি কি নিশ্চিত?" : "Are you sure?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'bn'
                  ? "এই অর্ডারটি স্থায়ীভাবে মুছে ফেলা হবে।"
                  : "This order will be permanently deleted."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {language === 'bn' ? "বাতিল" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {language === 'bn' ? "মুছুন" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
