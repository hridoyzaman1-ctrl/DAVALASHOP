import { Wallet, Smartphone, Building2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const ProductPaymentMethods = () => {
    const { language, paymentSettings } = useSettings();

    if (!paymentSettings.showBkash && !paymentSettings.showNagad && !paymentSettings.showBank && !paymentSettings.showCod) {
        return null;
    }

    return (
        <div className="bg-muted/20 p-6 rounded-none space-y-6 mt-6 border border-border">
            <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-light text-foreground">
                    {language === "bn" ? "পেমেন্ট তথ্য" : "Payment Information"}
                </h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                {language === "bn"
                    ? "অর্ডার কনফার্ম করার জন্য নিচের যে কোনো পদ্ধতিতে পেমেন্ট করতে পারেন। পেমেন্ট করার পর ট্রানজিশন আইডি বা স্ক্রিনশট আমাদের হোয়াটসঅ্যাপে পাঠিয়ে দিন।"
                    : "You can pay using any of the methods below to confirm your order. After payment, please send the transaction ID or screenshot to our WhatsApp."}
            </p>

            <div className="grid grid-cols-1 gap-4">
                {paymentSettings.showBkash && (
                    <div className="p-4 border border-border bg-background rounded-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#e2136e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Smartphone className="h-5 w-5 text-[#e2136e]" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">bKash Personal</p>
                            <p className="font-medium text-lg tracking-wider">{paymentSettings.bkashNumber}</p>
                        </div>
                    </div>
                )}

                {paymentSettings.showNagad && (
                    <div className="p-4 border border-border bg-background rounded-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#f7941d]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Smartphone className="h-5 w-5 text-[#f7941d]" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Nagad Personal</p>
                            <p className="font-medium text-lg tracking-wider">{paymentSettings.nagadNumber}</p>
                        </div>
                    </div>
                )}

                {paymentSettings.showBank && (
                    <div className="p-4 border border-border bg-background rounded-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Bank Account Information</p>
                            <p className="text-sm whitespace-pre-line leading-relaxed mt-1">
                                {paymentSettings.bankInfo}
                            </p>
                        </div>
                    </div>
                )}

                {paymentSettings.showCod && (
                    <div className="p-4 border border-border bg-background rounded-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Wallet className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Cash On Delivery</p>
                            <p className="text-sm mt-1">
                                {language === "bn" ? "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন" : "Pay with cash upon delivery"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPaymentMethods;
