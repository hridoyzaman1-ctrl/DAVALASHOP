import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { Save, MessageCircle, MapPin, Truck, Globe, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [deliveryDhakaPrice, setDeliveryDhakaPrice] = useState("");
  const [deliveryOutsideDhakaPrice, setDeliveryOutsideDhakaPrice] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [showStoreMap, setShowStoreMap] = useState("true");
  const [storeMapUrl, setStoreMapUrl] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [showBkash, setShowBkash] = useState("false");
  const [nagadNumber, setNagadNumber] = useState("");
  const [showNagad, setShowNagad] = useState("false");
  const [bankInfo, setBankInfo] = useState("");
  const [showBank, setShowBank] = useState("false");
  const [showCod, setShowCod] = useState("false");

  useEffect(() => {
    if (settings) {
      const getSetting = (key: string, defaultValue: string = "") =>
        settings.find((s) => s.key === key)?.value || defaultValue;

      setWhatsappNumber(getSetting("whatsapp_number"));
      setSiteName(getSetting("site_name"));
      setSiteDescription(getSetting("site_description"));
      setDeliveryDhakaPrice(getSetting("delivery_dhaka_price", "80"));
      setDeliveryOutsideDhakaPrice(getSetting("delivery_outside_dhaka_price", "150"));
      setAddressLine1(getSetting("address_line1"));
      setAddressLine2(getSetting("address_line2"));
      setPhone(getSetting("phone"));
      setEmail(getSetting("email"));
      setInstagramUrl(getSetting("instagram_url"));
      setTiktokUrl(getSetting("tiktok_url"));
      setFacebookUrl(getSetting("facebook_url"));
      setShowStoreMap(getSetting("show_store_map", "true"));
      setStoreMapUrl(getSetting("store_map_url", ""));
      setBkashNumber(getSetting("bkash_number"));
      setShowBkash(getSetting("show_bkash", "false"));
      setNagadNumber(getSetting("nagad_number"));
      setShowNagad(getSetting("show_nagad", "false"));
      setBankInfo(getSetting("bank_info"));
      setShowBank(getSetting("show_bank", "false"));
      setShowCod(getSetting("show_cod", "false"));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "whatsapp_number", value: whatsappNumber }),
        updateSetting.mutateAsync({ key: "site_name", value: siteName }),
        updateSetting.mutateAsync({ key: "site_description", value: siteDescription }),
        updateSetting.mutateAsync({ key: "delivery_dhaka_price", value: deliveryDhakaPrice }),
        updateSetting.mutateAsync({ key: "delivery_outside_dhaka_price", value: deliveryOutsideDhakaPrice }),
        updateSetting.mutateAsync({ key: "address_line1", value: addressLine1 }),
        updateSetting.mutateAsync({ key: "address_line2", value: addressLine2 }),
        updateSetting.mutateAsync({ key: "phone", value: phone }),
        updateSetting.mutateAsync({ key: "email", value: email }),
        updateSetting.mutateAsync({ key: "instagram_url", value: instagramUrl }),
        updateSetting.mutateAsync({ key: "tiktok_url", value: tiktokUrl }),
        updateSetting.mutateAsync({ key: "facebook_url", value: facebookUrl }),
        updateSetting.mutateAsync({ key: "show_store_map", value: showStoreMap }),
        updateSetting.mutateAsync({ key: "store_map_url", value: storeMapUrl }),
        updateSetting.mutateAsync({ key: "bkash_number", value: bkashNumber }),
        updateSetting.mutateAsync({ key: "show_bkash", value: showBkash }),
        updateSetting.mutateAsync({ key: "nagad_number", value: nagadNumber }),
        updateSetting.mutateAsync({ key: "show_nagad", value: showNagad }),
        updateSetting.mutateAsync({ key: "bank_info", value: bankInfo }),
        updateSetting.mutateAsync({ key: "show_bank", value: showBank }),
        updateSetting.mutateAsync({ key: "show_cod", value: showCod }),
      ]);
      toast({ title: "Settings saved successfully" });
    } catch (error) {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="text-muted-foreground">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-8">
        {/* Site Settings */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-lg font-medium text-foreground">Site Settings</h2>

          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="DAVALA"
            />
          </div>

          <div className="space-y-2">
            <Label>Site Description</Label>
            <Input
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Premium cosmetics for all"
            />
          </div>
        </div>


        {/* Delivery Settings */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Delivery Pricing</h2>
              <p className="text-sm text-muted-foreground">
                Set delivery charges for different locations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inside Dhaka (৳)</Label>
              <Input
                type="number"
                value={deliveryDhakaPrice}
                onChange={(e) => setDeliveryDhakaPrice(e.target.value)}
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label>Outside Dhaka (৳)</Label>
              <Input
                type="number"
                value={deliveryOutsideDhakaPrice}
                onChange={(e) => setDeliveryOutsideDhakaPrice(e.target.value)}
                placeholder="150"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Contact Information</h2>
              <p className="text-sm text-muted-foreground">
                Address and contact details shown on the website
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Address Line 1</Label>
              <Input
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Merul Badda, Dhaka"
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number(s)</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017..., 018..."
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Enter multiple numbers separated by commas
                </p>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@davala.me"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Map Settings */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Store Map Visibility</h2>
              <p className="text-sm text-muted-foreground">
                Show or hide the interactive map on the Store Locator page
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Show Store Map</Label>
              <Select value={showStoreMap} onValueChange={setShowStoreMap}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Show Map</SelectItem>
                  <SelectItem value="false">Hide Map</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showStoreMap === "true" && (
              <div className="space-y-2">
                <Label>Google Maps Embed URL</Label>
                <Input
                  value={storeMapUrl}
                  onChange={(e) => setStoreMapUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste the <code>&lt;iframe&gt;</code> src URL from Google Maps share embed option
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Settings */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Payment Methods</h2>
              <p className="text-sm text-muted-foreground">
                Manage payment options shown during checkout
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* bKash */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-base">bKash Payment</Label>
                <Select value={showBkash} onValueChange={setShowBkash}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Show</SelectItem>
                    <SelectItem value="false">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showBkash === "true" && (
                <div className="space-y-2">
                  <Label>bKash Number</Label>
                  <Input
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              )}
            </div>

            {/* Nagad */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-base">Nagad Payment</Label>
                <Select value={showNagad} onValueChange={setShowNagad}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Show</SelectItem>
                    <SelectItem value="false">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showNagad === "true" && (
                <div className="space-y-2">
                  <Label>Nagad Number</Label>
                  <Input
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              )}
            </div>

            {/* Bank */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-base">Bank Transfer</Label>
                <Select value={showBank} onValueChange={setShowBank}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Show</SelectItem>
                    <SelectItem value="false">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showBank === "true" && (
                <div className="space-y-2">
                  <Label>Bank Account Information</Label>
                  <Textarea
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                    placeholder="Bank Name: ...&#10;Account Name: ...&#10;Account Number: ..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>
            {/* COD */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-base">Cash On Delivery</Label>
                <Select value={showCod} onValueChange={setShowCod}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Show</SelectItem>
                    <SelectItem value="false">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Globe className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">Social Media Links</h2>
              <p className="text-sm text-muted-foreground">
                Links to your social media profiles
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/davala"
              />
            </div>
            <div className="space-y-2">
              <Label>TikTok URL</Label>
              <Input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@davala"
              />
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/davala"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="bg-background p-6 rounded-lg border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">WhatsApp Contact</h2>
              <p className="text-sm text-muted-foreground">
                This number will be shown on the checkout page for order inquiries
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+880 1234-567890"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +880 for Bangladesh)
            </p>
          </div>

          {whatsappNumber && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={updateSetting.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
};


export default AdminSettings;
