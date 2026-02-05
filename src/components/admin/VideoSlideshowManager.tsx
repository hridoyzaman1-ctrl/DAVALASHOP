import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Link as LinkIcon, GripVertical, Plus, Video } from "lucide-react";

interface VideoSlideshowManagerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  maxVideos?: number;
}

const VideoSlideshowManager = ({
  value = [],
  onChange,
  bucket = "landing-images",
  maxVideos = 10,
}: VideoSlideshowManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    if (value.length >= maxVideos) {
      toast({
        title: "Maximum videos reached",
        description: `You can only have ${maxVideos} videos in the slideshow`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange([...value, publicUrl]);
      toast({
        title: "Video uploaded",
        description: "Video added to slideshow",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [bucket, onChange, toast, value, maxVideos]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      if (value.length >= maxVideos) {
        toast({
          title: "Maximum videos reached",
          description: `You can only have ${maxVideos} videos in the slideshow`,
          variant: "destructive",
        });
        return;
      }
      onChange([...value, urlInput.trim()]);
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = value.filter((_, i) => i !== index);
    onChange(newVideos);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newVideos = [...value];
    const draggedVideo = newVideos[draggedIndex];
    newVideos.splice(draggedIndex, 1);
    newVideos.splice(index, 0, draggedVideo);
    onChange(newVideos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Video Slideshow ({value.length}/{maxVideos})</Label>
      </div>

      {/* Video List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-2 rounded-lg border bg-card transition-all ${
                draggedIndex === index ? "opacity-50 border-primary" : "hover:border-muted-foreground/30"
              }`}
            >
              <div className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              
              <div className="relative w-24 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 text-white text-[10px] rounded flex items-center gap-0.5">
                  <Video className="h-2 w-2" />
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{url}</p>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeVideo(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Controls */}
      {value.length < maxVideos && (
        <div className="space-y-3">
          {showUrlInput ? (
            <div className="flex gap-2">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter video URL"
                className="flex-1"
              />
              <Button type="button" onClick={handleUrlSubmit} size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlInput(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                asChild
              >
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Video"}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Add default videos
                  const defaults = [
                    "/hero-davala-video.mp4",
                    "/hero-video-2.mp4",
                    "/hero-video-3.mp4",
                    "/hero-video-4.mp4",
                  ];
                  const newVideos = [...value, ...defaults.filter(d => !value.includes(d))].slice(0, maxVideos);
                  onChange(newVideos);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Defaults
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Drag to reorder • Upload MP4/WebM (max 50MB) or paste URL
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoSlideshowManager;
