import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { LayoutDashboard, Package, Activity as ActivityIcon, Image as ImageIcon, FileText, Settings, LogOut, CalendarDays, Inbox, MessageSquare, Trophy, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

const API = import.meta.env.BASE_URL + "api";
const logo = "/images/logo_transparent.png";

const ADMIN_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Booking Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Packages", href: "/packages", icon: Package },
  { name: "Activities", href: "/activities", icon: ActivityIcon },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Inquiries", href: "/inquiries", icon: Inbox },
  { name: "Live Chat", href: "/chat", icon: MessageSquare },
  { name: "Awards", href: "/awards", icon: Trophy },
  { name: "FAQ", href: "/faqs", icon: HelpCircle },
  { name: "Blog Posts", href: "/blog", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const [siteName, setSiteName] = useState("Shubhangi The Boat House");
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.siteName) setSiteName(d.siteName);
        if (d.siteLogo) setSiteLogo(d.siteLogo);
      })
      .catch(() => {});
  }, []);

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
        <div className="px-4 py-5 border-b border-border">
          <Link href="/" className="flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors group">
            <img
              src={siteLogo || logo}
              alt={siteName}
              className="h-14 w-full object-contain object-center"
            />
            <span className="text-xs font-semibold text-center text-foreground/80 leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {siteName}
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
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
            {ADMIN_LINKS.find(l => location === l.href || (l.href !== "/" && location.startsWith(l.href)))?.name || "Dashboard"}
          </h1>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
