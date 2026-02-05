import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscribeNewsletter } from "@/hooks/useNewsletter";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email().max(255);

const NewsletterSection = () => {
    const { language } = useSettings();
    const [email, setEmail] = useState("");
    const subscribe = useSubscribeNewsletter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = emailSchema.safeParse(email.trim());
        if (!validation.success) {
            toast.error(language === 'bn' ? "সঠিক ইমেইল দিন" : "Please enter a valid email");
            return;
        }

        try {
            await subscribe.mutateAsync(email.trim());
            // Unified success message requested by user
            const message = language === 'bn'
                ? "দাভালা শপ ফ্যামিলিতে যোগ দেওয়ার জন্য ধন্যবাদ"
                : "Thank you for joining Davala Shop Family";
            toast.success(message);
            setEmail("");
        } catch (error: any) {
            // Show same success message even on error/duplicate to avoid confusion (User Request)
            const message = language === 'bn'
                ? "দাভালা শপ ফ্যামিলিতে যোগ দেওয়ার জন্য ধন্যবাদ"
                : "Thank you for joining Davala Shop Family";

            // We still log error for debugging but show success to user
            console.error("Newsletter error suppressed:", error);
            toast.success(message);

            // Clear email to indicate "success"
            setEmail("");
        }
    };

    return (
        <div className="w-full py-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <div className="max-w-xl mx-auto px-6 text-center">
                <h3 className="text-xl font-light text-foreground mb-2">
                    {language === 'bn' ? 'নিউজলেটারে সাবস্ক্রাইব করুন' : 'Subscribe to Our Newsletter'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                    {language === 'bn'
                        ? 'নতুন পণ্য এবং বিশেষ অফার সম্পর্কে প্রথমে জানুন'
                        : 'Be the first to know about new products and exclusive offers'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'bn' ? 'আপনার ইমেইল ঠিকানা' : 'Enter your email address'}
                        className="flex-1 rounded-none border-border bg-background"
                        required
                        maxLength={255}
                    />
                    <Button
                        type="submit"
                        className="rounded-none px-8"
                        disabled={subscribe.isPending}
                    >
                        {subscribe.isPending
                            ? (language === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...')
                            : (language === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe')}
                    </Button>
                </form>

                <p className="text-xs text-muted-foreground mt-4">
                    {language === 'bn'
                        ? 'সাবস্ক্রাইব করে আপনি আমাদের গোপনীয়তা নীতিতে সম্মত হচ্ছেন'
                        : 'By subscribing, you agree to our Privacy Policy'}
                </p>
            </div>
        </div>
    );
};

export default NewsletterSection;