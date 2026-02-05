import { useSettings } from "@/contexts/SettingsContext";

const DeliveryBanner = () => {
  const { t } = useSettings();

  return (
    <div className="w-full py-6 mb-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        <div className="max-w-7xl mx-auto px-6 py-4 relative">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent via-primary/30 to-primary/30" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  className="w-5 h-5 text-primary"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-light">
                  {t("delivery.title").split(' ')[0]}
                </p>
                <p className="text-sm font-light text-foreground tracking-wide">
                  {t("footer.home_delivery")}
                </p>
              </div>
            </div>
            
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-primary/30 via-primary/30 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBanner;
