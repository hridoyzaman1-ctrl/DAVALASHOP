import { MessageCircle } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useSettings } from "@/contexts/SettingsContext";

const WhatsAppContact = () => {
  const { data: whatsappNumber } = useSiteSetting("whatsapp_number");
  const { t } = useSettings();

  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hi, I have a question about my order.`;

  return (
    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-6">
      <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <div className="p-3 bg-green-500 rounded-full shrink-0">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{t("checkout.need_help")}</h3>
          <p className="text-sm text-muted-foreground mt-1 md:mt-0">
            {t("checkout.whatsapp_help")}
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          <MessageCircle className="h-5 w-5" />
          {t("checkout.chat_now")}
        </a>
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        WhatsApp: {whatsappNumber}
      </p>
    </div>
  );
};

export default WhatsAppContact;