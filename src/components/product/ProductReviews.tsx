import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProductReviews, useCreateReview } from "@/hooks/useReviews";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { data: reviews, isLoading } = useProductReviews(productId);
  const createReview = useCreateReview();
  const { t, language, formatNumber } = useSettings();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    rating: 0,
    title: "",
    comment: "",
  });

  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const handleWriteReviewClick = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error(language === 'bn' ? "অনুগ্রহ করে রেটিং দিন" : "Please select a star rating");
      return;
    }

    if (!formData.customer_name.trim() || !formData.comment.trim()) {
      toast.error(language === 'bn' ? "নাম এবং মন্তব্য আবশ্যক" : "Name and comment are required");
      return;
    }

    try {
      await createReview.mutateAsync({
        product_id: productId,
        ...formData,
      });
      toast.success(language === 'bn' ? "রিভিউ জমা হয়েছে!" : "Review submitted!");
      setFormData({ customer_name: "", customer_email: "", rating: 0, title: "", comment: "" });
      setShowForm(false);
    } catch (error) {
      toast.error(language === 'bn' ? "রিভিউ জমা করতে সমস্যা হয়েছে" : "Failed to submit review");
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setFormData(prev => ({ ...prev, rating: star }))}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`h-4 w-4 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-light text-foreground">
            {language === 'bn' ? 'গ্রাহক রিভিউ' : 'Customer Reviews'}
          </h3>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(parseFloat(averageRating)))}
              <span className="text-sm text-muted-foreground">
                {language === 'bn' ? `${formatNumber(parseFloat(averageRating))} (${formatNumber(reviews.length)} রিভিউ)` : `${averageRating} (${reviews.length} reviews)`}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleWriteReviewClick}
          className="rounded-none"
        >
          {language === 'bn' ? 'রিভিউ লিখুন' : 'Write a Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-light text-foreground block mb-2">
                {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
              </label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="rounded-none"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-light text-foreground block mb-2">
                {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
              </label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                className="rounded-none"
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'bn' ? 'আপনার ইমেইল শুধুমাত্র প্রশাসকদের দেখা যাবে' : 'Your email will only be visible to admins'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-light text-foreground block mb-2">
              {language === 'bn' ? 'রেটিং *' : 'Rating *'}
            </label>
            {renderStars(formData.rating, true)}
          </div>

          <div>
            <label className="text-sm font-light text-foreground block mb-2">
              {language === 'bn' ? 'শিরোনাম (ঐচ্ছিক)' : 'Title (Optional)'}
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="rounded-none"
              placeholder={language === 'bn' ? 'আপনার রিভিউর শিরোনাম' : 'Summary of your review'}
              maxLength={200}
            />
          </div>

          <div>
            <label className="text-sm font-light text-foreground block mb-2">
              {language === 'bn' ? 'আপনার মন্তব্য *' : 'Your Review *'}
            </label>
            <Textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="rounded-none min-h-24"
              placeholder={language === 'bn' ? 'এই পণ্য সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share your experience with this product'}
              required
              maxLength={1000}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="rounded-none" disabled={createReview.isPending}>
              {createReview.isPending
                ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                : (language === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-none">
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-6 divide-y divide-border">
          {reviews.map((review) => (
            <div key={review.id} className="pt-6 first:pt-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    {review.is_verified_purchase && (
                      <span className="text-xs text-primary font-medium">
                        {language === 'bn' ? '✓ যাচাইকৃত ক্রয়' : '✓ Verified Purchase'}
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-foreground">{review.title}</h4>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
              <p className="text-xs text-foreground font-medium">— {review.customer_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {language === 'bn' ? 'এখনও কোন রিভিউ নেই। প্রথম রিভিউ দিন!' : 'No reviews yet. Be the first to review!'}
        </p>
      )}
    </div>
  );
};

export default ProductReviews;
