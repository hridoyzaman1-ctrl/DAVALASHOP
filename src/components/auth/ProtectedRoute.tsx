
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUsersForAdmin } from "@/hooks/useUserRoles";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    // We need to fetch the user's role.
    // We can misuse useUsersForAdmin but that returns ALL users.
    // Better to have a specific hook or just check the profile/role table for CURRENT user.
    // However, for now, let's reuse the context or hook if available.
    // Realistically, we should make a new hook `useCurrentUserRole`.
    // But to be quick and robust, let's just check the user_roles table or assume the `isAdmin` boolean from `Navigation` logic can be extracted.
    // Wait, Navigation.tsx used `isAdmin` from `useAuth`? No, it used `useAuth` then checked.
    // Let's check `AuthContext`.

    // Checking AuthContext first to see if it exposes role.
    // If not, I will implement a quick role check here.

    if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    if (!user) return <Navigate to="/auth" replace />;

    return <AdminRouteInner user={user}>{children}</AdminRouteInner>;
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminRouteInner = ({ user, children }: { user: any, children: React.ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkRole() {
            const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'admin')
                .maybeSingle();

            setIsAdmin(!!data);
        }
        checkRole();
    }, [user]);

    if (isAdmin === null) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
