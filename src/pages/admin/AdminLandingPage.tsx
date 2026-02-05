import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLandingPageSections, useUpdateLandingPageSection, LandingPageSection } from "@/hooks/useLandingPageSections";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoSlideshowManager from "@/components/admin/VideoSlideshowManager";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Image as ImageIcon, Eye, EyeOff, Video } from "lucide-react";

const pageOptions = [
  { value: "home", label: "Home Page" },
  { value: "our-story", label: "Our Story" },
  { value: "sustainability", label: "Sustainability" },
  { value: "customer-care", label: "Customer Care" },
  { value: "size-guide", label: "Size Guide" },
  { value: "store-locator", label: "Store Locator" },
];

const sectionLabels: Record<string, { name: string; description: string }> = {
  hero: { name: "Hero Section", description: "Main full-viewport hero at the top of the page" },
  fifty_fifty_left: { name: "Featured Left", description: "Left side of the 50/50 grid section" },
  fifty_fifty_right: { name: "Featured Right", description: "Right side of the 50/50 grid section" },
  large_hero: { name: "Banner Section", description: "Wide banner in the middle of the page" },
  one_third: { name: "Small Feature", description: "1/3 width feature section" },
  two_thirds: { name: "Large Feature", description: "2/3 width feature section" },
  editorial: { name: "Editorial/Story", description: "Brand story section with text and image" },
  header: { name: "Page Header", description: "Title and subtitle at the top of the page" },
  mission: { name: "Our Mission", description: "Mission statement section" },
};

const AdminLandingPage = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const { data: sections, isLoading } = useLandingPageSections(currentPage);
  const updateSection = useUpdateLandingPageSection();
  const { toast } = useToast();

  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);
  const [formData, setFormData] = useState<Partial<LandingPageSection>>({});

  const openEditDialog = (section: LandingPageSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title || "",
      subtitle: section.subtitle || "",
      description: section.description || "",
      cta_text: section.cta_text || "",
      cta_link: section.cta_link || "",
      image_url: section.image_url || "",
      secondary_image_url: section.secondary_image_url || "",
      video_urls: section.video_urls || [],
      content_json: section.content_json || {},
      is_active: section.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    try {
      await updateSection.mutateAsync({
        id: editingSection.id,
        ...formData,
      });
      toast({
        title: "Section updated",
        description: "The section has been updated successfully",
      });
      setEditingSection(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (section: LandingPageSection) => {
    try {
      await updateSection.mutateAsync({
        id: section.id,
        is_active: !section.is_active,
      });
      toast({
        title: section.is_active ? "Section hidden" : "Section visible",
        description: `${sectionLabels[section.section_key]?.name || section.section_key} has been ${section.is_active ? "hidden" : "made visible"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section visibility",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Content Management">
        <div className="text-muted-foreground">Loading sections...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Content Management">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <p className="text-muted-foreground">
          Manage the content and images for various pages on your site.
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="page-select" className="whitespace-nowrap">Select Page:</Label>
          <select
            id="page-select"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {sections?.map((section) => {
          const labelInfo = sectionLabels[section.section_key] || {
            name: section.section_key,
            description: ""
          };

          return (
            <Card key={section.id} className={!section.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{labelInfo.name}</CardTitle>
                    <CardDescription>{labelInfo.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(section)}
                      title={section.is_active ? "Hide section" : "Show section"}
                    >
                      {section.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(section)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {/* Media Preview */}
                  <div className="w-32 h-20 rounded overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 relative">
                    {section.video_urls && section.video_urls.length > 0 ? (
                      <>
                        <video
                          src={section.video_urls[0]}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded flex items-center gap-0.5">
                          <Video className="h-2.5 w-2.5" />
                          {section.video_urls.length}
                        </div>
                      </>
                    ) : section.image_url ? (
                      <img
                        src={section.image_url}
                        alt={section.title || "Section image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{section.title || "No title"}</p>
                    {section.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{section.subtitle}</p>
                    )}
                    {section.cta_text && section.cta_link && (
                      <p className="text-xs text-primary mt-1">
                        {section.cta_text} → {section.cta_link}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {editingSection && sectionLabels[editingSection.section_key]?.name}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Button Text</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text || ""}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="e.g., Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_link">Button Link</Label>
                <Input
                  id="cta_link"
                  value={formData.cta_link || ""}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  placeholder="e.g., /category/skincare"
                />
              </div>
            </div>

            <ImageUploader
              label="Background Image (Fallback)"
              value={formData.image_url || null}
              onChange={(url) => setFormData({ ...formData, image_url: url || "" })}
              bucket="landing-images"
            />

            {editingSection?.section_key === "hero" && (
              <VideoSlideshowManager
                value={formData.video_urls || []}
                onChange={(urls) => setFormData({ ...formData, video_urls: urls })}
                bucket="landing-images"
                maxVideos={10}
              />
            )}

            {editingSection?.section_key === "editorial" && (
              <ImageUploader
                label="Secondary Image"
                value={formData.secondary_image_url || null}
                onChange={(url) => setFormData({ ...formData, secondary_image_url: url || "" })}
                bucket="landing-images"
              />
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Visible on homepage</Label>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSection.isPending}>
                  {updateSection.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminLandingPage;
