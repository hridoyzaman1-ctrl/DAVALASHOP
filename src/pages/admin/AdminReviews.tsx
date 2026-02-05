import { useState } from "react";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAllReviews, useUpdateReview, useDeleteReview } from "@/hooks/useReviews";
import { toast } from "sonner";

const AdminReviews = () => {
  const { data: reviews, isLoading } = useAllReviews();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = reviews?.filter(review => 
    review.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await updateReview.mutateAsync({ id, is_visible: !currentVisibility });
      toast.success(currentVisibility ? "Review hidden" : "Review visible");
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview.mutateAsync(id);
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-light">Reviews Management</h1>
          <div className="flex gap-4">
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
        ) : filteredReviews && filteredReviews.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-xs">Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id} className={!review.is_visible ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
                      {review.products?.name || "Unknown Product"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.customer_name}</p>
                        {review.customer_email && (
                          <p className="text-xs text-muted-foreground">{review.customer_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">
                        {review.title && <p className="font-medium text-sm">{review.title}</p>}
                        <p className="text-sm text-muted-foreground truncate">{review.comment}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${review.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {review.is_visible ? "Visible" : "Hidden"}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 ml-1">
                          Verified
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                          title={review.is_visible ? "Hide review" : "Show review"}
                        >
                          {review.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(review.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No reviews found.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;