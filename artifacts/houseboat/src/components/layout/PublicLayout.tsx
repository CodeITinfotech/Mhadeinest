import { Link, useLocation } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { Phone, Menu, X, Instagram, Facebook, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
const logo = "/images/logo_transparent.png";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "/packages" },
  { name: "Dining", href: "/dining" },
  { name: "Activities", href: "/activities" },
  { name: "Gallery", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: settings } = useGetSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappLink = settings?.whatsappNumber 
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hello!%20I%20would%20like%20to%20inquire%20about%20the%20houseboat.`
    : "#";

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
          isScrolled || location !== "/"
            ? "bg-background/95 backdrop-blur-md shadow-sm border-border py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="Shubhangi The Boat House"
              className="h-12 w-auto object-contain transition-all duration-300 drop-shadow-md"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-secondary",
                  location === link.href 
                    ? "text-secondary" 
                    : (isScrolled || location !== "/" ? "text-foreground" : "text-white/90")
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/90 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Book Now
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu className={cn(isScrolled || location !== "/" ? "text-foreground" : "text-white")} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-xl font-display">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "border-b border-border pb-4",
                    location === link.href ? "text-secondary" : "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-center flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Book via WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={logo}
                alt="Shubhangi The Boat House"
                className="h-16 w-auto object-contain brightness-0 invert opacity-90"
              />
            </div>
            <p className="text-primary-foreground/70 mb-6">
              {settings?.tagline || "Experience the ultimate luxury on the beautiful waters of Goa."}
            </p>
            <div className="flex gap-4">
              {settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-secondary">Quick Links</h4>
            <ul className="space-y-3">
              {NAV_LINKS.slice(0, 5).map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-primary-foreground/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-secondary">Contact Us</h4>
            <div className="space-y-4 text-primary-foreground/80">
              <p>Email: {settings?.inquiryEmail || "bookings@goahouseboat.com"}</p>
              <p>Phone: {settings?.whatsappNumber || "+91 98765 43210"}</p>
              <Link href="/admin/login" className="inline-block mt-8 text-sm opacity-50 hover:opacity-100 transition-opacity">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} {settings?.siteName || "Goa Houseboat"}. All rights reserved.
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <Phone className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-white text-foreground px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          Chat with us
        </span>
      </a>
    </div>
  );
}
