import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LandingPageSection {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  secondary_image_url: string | null;
  video_url: string | null;
  video_urls: string[] | null;
  content_json: any | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPageSectionInput {
  page_key?: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  secondary_image_url?: string;
  video_url?: string;
  video_urls?: string[];
  content_json?: any;
  is_active?: boolean;
  sort_order?: number;
}

export const useLandingPageSections = (pageKey: string = 'home') => {
  return useQuery({
    queryKey: ["landing-page-sections", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_sections")
        .select("*")
        .eq("page_key", pageKey)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as LandingPageSection[];
    },
  });
};

export const useLandingPageSection = (sectionKey: string, pageKey: string = 'home') => {
  return useQuery({
    queryKey: ["landing-page-sections", pageKey, sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_sections")
        .select("*")
        .eq("page_key", pageKey)
        .eq("section_key", sectionKey)
        .maybeSingle();

      if (error) throw error;
      return data as LandingPageSection | null;
    },
    enabled: !!sectionKey,
  });
};

export const useUpdateLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...section }: Partial<LandingPageSectionInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("landing_page_sections")
        .update(section)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-sections"] });
    },
  });
};

export const useCreateLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: LandingPageSectionInput) => {
      const { data, error } = await supabase
        .from("landing_page_sections")
        .insert(section)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-sections"] });
    },
  });
};

export const useDeleteLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("landing_page_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-sections"] });
    },
  });
};
