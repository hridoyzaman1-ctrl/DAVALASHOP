import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, FolderOpen, Settings, LogOut, Home, LayoutDashboard, ShoppingCart, Star, Users, UserCircle, Menu, X, Tag, Zap, Mail } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isAdmin, signOut, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-light text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
          <Button onClick={() => navigate("/")}>Return to Store</Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/customers", label: "Customers", icon: UserCircle },
    { href: "/admin/sales", label: "Flash Sales", icon: Zap },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavContent = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent"
              }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
      <div className="pt-4 mt-4 border-t border-border lg:hidden">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border lg:hidden">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground"
            >
              <LayoutDashboard className="h-6 w-6" />
            </Button>
            <Link to="/" className="text-lg font-light tracking-widest text-foreground">
              DAVALA
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Drawer Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border p-6 shadow-xl animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-light tracking-widest">DAVALA</span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">Admin</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <LogOut className="h-5 w-5 rotate-180" />
                </Button>
              </div>
              <NavContent />
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-background border-b border-border sticky top-0 z-40">
        <div className="px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-light tracking-widest text-foreground">
              DAVALA
            </Link>
            <Badge variant="secondary" className="font-medium">
              Admin Dashboard
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <UserCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium max-w-[150px] truncate">{user.email}</span>
            </div>
            <div className="h-4 w-[1px] bg-border mx-2" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-2" />
              View Store
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-destructive/20 text-destructive hover:bg-destructive/5">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-73px)] sticky top-[73px] bg-background border-r border-border p-6 overflow-y-auto">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          {title && <h1 className="text-2xl font-light text-foreground mb-8">{title}</h1>}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
