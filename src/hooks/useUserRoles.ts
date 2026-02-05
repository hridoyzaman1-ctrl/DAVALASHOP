import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
  full_name: string | null;
  address: string | null;
  mobile: string | null;
  avatar_url: string | null;
}

export const useUsersForAdmin = () => {
  return useQuery({
    queryKey: ["users-for-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_users_for_admin");
      if (error) throw error;
      return data as UserWithRole[];
    },
  });
};

export const useGrantAdminRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-for-admin"] });
      toast({ title: "Admin role granted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to grant admin role", description: error.message, variant: "destructive" });
    },
  });
};

export const useRevokeAdminRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-for-admin"] });
      toast({ title: "Admin role revoked successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to revoke admin role", description: error.message, variant: "destructive" });
    },
  });
};
