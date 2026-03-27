import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { LayoutDashboard, Package, Activity as ActivityIcon, Image as ImageIcon, FileText, Settings, LogOut, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const logo = "/images/logo.jpg";

const ADMIN_LINKS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Booking Calendar", href: "/admin/calendar", icon: CalendarDays },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Activities", href: "/admin/activities", icon: ActivityIcon },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, isLoading, logout } = useAdminAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/30">Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = "/admin/login";
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/20 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <img src={logo} alt="Shubhangi The Boat House" className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-foreground">
            {ADMIN_LINKS.find(l => location === l.href || (l.href !== "/admin" && location.startsWith(l.href)))?.name || "Dashboard"}
          </h1>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
