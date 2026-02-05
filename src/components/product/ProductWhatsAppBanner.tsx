import { MessageCircle } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useSettings } from "@/contexts/SettingsContext";

const ProductWhatsAppBanner = () => {
    const { data: whatsappNumber } = useSiteSetting("whatsapp_number");
    const { language } = useSettings();

    if (!whatsappNumber) return null;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hi, I have a question about this product.`;

    return (
        <div className="bg-green-500/5 border border-green-500/20 p-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                    <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-base font-light text-foreground">
                        {language === "bn" ? "সরাসরি সহায়তা প্রয়োজন?" : "Need Direct Assistance?"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {language === "bn"
                            ? `অর্ডার সংক্রান্ত যে কোন প্রয়োজনে আমাদের হোয়াটসঅ্যাপে মেসেজ দিন: ${whatsappNumber}`
                            : `For order details or query, contact our team on WhatsApp: ${whatsappNumber}`}
                    </p>
                </div>
            </div>
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/20"
            >
                <MessageCircle className="h-4 w-4" />
                {language === "bn" ? "হোয়াটসঅ্যাপে চ্যাট করুন" : "Chat on WhatsApp"}
            </a>
        </div>
    );
};

export default ProductWhatsAppBanner;
