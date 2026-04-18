import { Link, useLocation } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Menu, X, Instagram, Facebook, Youtube, MessageCircle, Trophy, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { InquiryModal } from "@/components/InquiryModal";
import { InquiryModalProvider, useInquiryModal } from "@/context/InquiryModalContext";
import { CurrencyProvider, useCurrency, type Currency } from "@/context/CurrencyContext";
import { ChatWidget } from "@/components/ChatWidget";

const ALL_NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "/packages" },
  { name: "Activities", href: "/activities" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
  { name: "About", href: "/about" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <InquiryModalProvider>
        <PublicLayoutInner>{children}</PublicLayoutInner>
      </InquiryModalProvider>
    </CurrencyProvider>
  );
}

function CurrencySwitcher({ scrolled, onHome }: { scrolled: boolean; onHome: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const isLight = scrolled || !onHome;
  return (
    <select
      value={currency}
      onChange={e => setCurrency(e.target.value as Currency)}
      className={cn(
        "text-[11px] font-bold rounded-full px-2.5 py-1 border cursor-pointer outline-none transition-colors",
        isLight
          ? "bg-muted border-border text-foreground hover:bg-muted/80"
          : "bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/25"
      )}
    >
      <option value="INR">INR ₹</option>
      <option value="GBP">GBP £</option>
      <option value="USD">USD $</option>
    </select>
  );
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface Award {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
}

function PublicLayoutInner({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOpen: inquiryOpen, prefill: inquiryPrefill, open: openInquiry, close: closeInquiry } = useInquiryModal();
  const { data: settings, isLoading: settingsLoading } = useGetSettings();

  const { data: allAwards = [] } = useQuery<Award[]>({
    queryKey: ["awards-public"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/awards`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const activeAwards = allAwards.filter(a => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const hasCustomLogo = Boolean((settings as any)?.siteLogo);
  const logo = (settings as any)?.siteLogo ?? "";
  const hiddenItems: string[] = (settings as any)?.navHiddenItems || [];
  const showChat = (settings as any)?.showChatWidget !== "false";
  const chatWidgetColor: string = (settings as any)?.chatWidgetColor || "#10b981";
  const chatWidgetAlignment: "left" | "right" = (settings as any)?.chatWidgetAlignment === "left" ? "left" : "right";
  const showWhatsapp = (settings as any)?.showWhatsappButton !== "false";
  const NAV_LINKS = ALL_NAV_LINKS.filter(l => !hiddenItems.includes(l.name));

  // Keep browser tab title in sync with site name
  useEffect(() => {
    if (settings?.siteName) {
      document.title = `${settings.siteName} | Luxury River Experience in Goa`;
    }
  }, [settings?.siteName]);

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeNavBg: string = (settings as any)?.themeNavBg || "";
  const themeFooterBg: string = (settings as any)?.themeFooterBg || "";
  const themeButtonColor: string = (settings as any)?.themeButtonColor || "";
  const themeTextColor: string = (settings as any)?.themeTextColor || "";

  useEffect(() => {
    const parts: string[] = [];
    const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
    if (isHex(themeButtonColor)) parts.push(`--secondary: ${hexToHsl(themeButtonColor)};`);
    if (isHex(themeTextColor)) parts.push(`--foreground: ${hexToHsl(themeTextColor)};`);
    let el = document.getElementById("theme-overrides") as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = "theme-overrides";
      document.head.appendChild(el);
    }
    el.textContent = parts.length ? `:root { ${parts.join(" ")} }` : "";
  }, [themeButtonColor, themeTextColor]);

  const whatsappLink = settings?.whatsappNumber 
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hello!%20I%20would%20like%20to%20inquire%20about%20Mhadeinest.`
    : "#";

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground">
      {/* Header — always visible, scroll deepens the shadow */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-border",
          isScrolled ? "shadow-md py-3" : "shadow-sm py-4",
          !themeNavBg && "bg-background/97"
        )}
        style={themeNavBg ? { backgroundColor: themeNavBg } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a
            href="/"
            onClick={e => { e.preventDefault(); window.location.href = "/"; }}
            className="flex items-center shrink-0 cursor-pointer group"
          >
            {settingsLoading ? (
              <div className={cn("w-auto transition-all duration-300 max-w-[300px]", isScrolled ? "h-12" : "h-[68px]")} />
            ) : hasCustomLogo ? (
              <img
                src={logo}
                alt={settings?.siteName || "Mhadeinest"}
                className={cn(
                  "w-auto object-contain transition-all duration-300 max-w-[300px]",
                  isScrolled ? "h-12" : "h-[68px]"
                )}
              />
            ) : (
              <span className={cn(
                "font-display font-bold text-primary transition-all duration-300 group-hover:text-secondary",
                isScrolled ? "text-lg" : "text-2xl"
              )}>
                {settings?.siteName || "Mhadeinest"}
              </span>
            )}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-7">
            {(() => {
              const resourceLinks = NAV_LINKS.filter(l => l.name === "Gallery" || l.name === "Blog");
              const hasResources = resourceLinks.length > 0;
              let resourcesRendered = false;
              return NAV_LINKS.map((link) => {
                if (link.name === "Gallery" || link.name === "Blog") {
                  if (resourcesRendered) return null;
                  resourcesRendered = true;
                  if (!hasResources) return null;
                  return (
                    <div key="resources" className="relative group">
                      <button className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-colors relative py-1",
                        (location === "/gallery" || location === "/blog")
                          ? "text-secondary"
                          : "text-foreground/80 hover:text-primary"
                      )}>
                        Resources
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                        <span className={cn(
                          "absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-secondary transition-all duration-200",
                          (location === "/gallery" || location === "/blog") ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                        )} />
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
                        <div className="bg-background border border-border rounded-xl shadow-lg py-1.5 min-w-[130px]">
                          {resourceLinks.map(rl => (
                            <Link
                              key={rl.name}
                              href={rl.href}
                              className={cn(
                                "flex items-center px-4 py-2.5 text-sm font-medium transition-colors",
                                location === rl.href
                                  ? "text-secondary bg-primary/5"
                                  : "text-foreground/80 hover:text-primary hover:bg-muted"
                              )}
                            >
                              {rl.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors relative py-1 group",
                      location === link.href
                        ? "text-secondary"
                        : "text-foreground/80 hover:text-primary"
                    )}
                  >
                    {link.name}
                    <span className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 bg-secondary",
                      location === link.href ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
                    )} />
                  </Link>
                );
              });
            })()}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <CurrencySwitcher scrolled={true} onHome={false} />
            <button
              onClick={() => openInquiry()}
              className="px-5 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105 shadow-sm flex items-center gap-2 border bg-background border-border text-foreground hover:bg-muted"
            >
              <MessageCircle className="w-4 h-4" />
              Inquire
            </button>
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
            {mobileMenuOpen ? <X className="text-foreground" /> : <Menu className="text-foreground" />}
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Dropdown Menu — slides from below the header, not fullscreen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop (click to close, does NOT cover header) */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ top: isScrolled ? 56 : 72 }}
              className="fixed inset-x-0 bottom-0 z-30 bg-black/30 backdrop-blur-[2px] md:hidden"
            />

            {/* Dropdown panel */}
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ top: isScrolled ? 56 : 72, maxHeight: `calc(100vh - ${isScrolled ? 56 : 72}px)` }}
              className="fixed left-0 right-0 z-40 bg-background/97 backdrop-blur-md border-b border-border shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="px-5 py-4 space-y-1">
                {/* Main nav links (excluding Gallery & Blog) */}
                {NAV_LINKS.filter(l => l.name !== "Gallery" && l.name !== "Blog").map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors",
                      location === link.href
                        ? "bg-primary/8 text-secondary font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {location === link.href && (
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    )}
                    {link.name}
                  </Link>
                ))}
                {/* Resources group (Gallery + Blog) */}
                {NAV_LINKS.some(l => l.name === "Gallery" || l.name === "Blog") && (
                  <div className="pt-1">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Resources</p>
                    {NAV_LINKS.filter(l => l.name === "Gallery" || l.name === "Blog").map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          location === link.href
                            ? "bg-primary/8 text-secondary font-semibold"
                            : "text-foreground/80 hover:bg-muted"
                        )}
                      >
                        {location === link.href && (
                          <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                        )}
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-border my-2" />

                {/* Currency + action buttons */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xs text-muted-foreground font-medium">Currency:</span>
                  <CurrencySwitcher scrolled={true} onHome={false} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 pb-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); openInquiry(); }}
                    className="px-4 py-3 rounded-xl border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Inquire
                  </button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Book Now
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer
        className={cn("text-primary-foreground py-16 mt-auto", !themeFooterBg && "bg-primary")}
        style={themeFooterBg ? { backgroundColor: themeFooterBg } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-6">
              <p className="font-display font-bold text-4xl md:text-5xl text-white leading-none tracking-tight drop-shadow-sm">
                {settings?.siteName || "Mhadeinest"}
              </p>
            </div>
            <p className="text-primary-foreground/70 mb-6">
              {settings?.tagline || "Experience the ultimate luxury on the beautiful waters of Goa."}
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
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

          {/* Quick Links column */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-display font-semibold mb-6 text-secondary">Quick Links</h4>
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 md:flex-col md:gap-0 md:space-y-3">
              {NAV_LINKS.filter(l => l.name !== "Gallery" && l.name !== "Blog").map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-primary-foreground/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              {NAV_LINKS.some(l => l.name === "Gallery" || l.name === "Blog") && (
                <>
                  <li className="md:mt-4 mt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/40">Resources</span>
                  </li>
                  {NAV_LINKS.filter(l => l.name === "Gallery" || l.name === "Blog").map(link => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-primary-foreground/70 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Contact column */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-display font-semibold mb-6 text-secondary">Contact Us</h4>
            <div className="space-y-4 text-primary-foreground/80">
              <p>Email: {settings?.inquiryEmail || "bookings@mhadeinest.com"}</p>
              <p>Phone: {settings?.whatsappNumber || "+91 98765 43210"}</p>
              <Link href="/admin/login" className="inline-block mt-8 text-sm opacity-50 hover:opacity-100 transition-opacity">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
        {/* Awards Recognition Strip */}
        {activeAwards.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-primary-foreground/10">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 text-primary-foreground/60">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Awards & Recognition</span>
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {activeAwards.map(award => (
                  <div key={award.id} className="flex flex-col items-center gap-2 group">
                    {award.link ? (
                      <a href={award.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                        {award.image ? (
                          <img
                            src={award.image}
                            alt={award.title}
                            className="h-14 w-auto max-w-[100px] object-contain opacity-80 group-hover:opacity-100 transition-opacity filter brightness-0 invert"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                            <Trophy className="w-6 h-6 text-secondary" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-xs font-semibold text-primary-foreground/80 group-hover:text-white transition-colors leading-tight max-w-[110px]">{award.title}</p>
                          {award.subtitle && <p className="text-[10px] text-primary-foreground/50 mt-0.5 leading-tight max-w-[110px]">{award.subtitle}</p>}
                        </div>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {award.image ? (
                          <img
                            src={award.image}
                            alt={award.title}
                            className="h-14 w-auto max-w-[100px] object-contain opacity-80 filter brightness-0 invert"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-secondary" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-xs font-semibold text-primary-foreground/80 leading-tight max-w-[110px]">{award.title}</p>
                          {award.subtitle && <p className="text-[10px] text-primary-foreground/50 mt-0.5 leading-tight max-w-[110px]">{award.subtitle}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} {settings?.siteName || "Mhadeinest"}. All rights reserved.
        </div>
      </footer>

      {/* Inquiry Modal */}
      <InquiryModal open={inquiryOpen} onClose={closeInquiry} initialData={inquiryPrefill ?? undefined} />

      {/* Floating WhatsApp Button — always in same corner as chat widget */}
      {showWhatsapp && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "fixed bottom-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center group",
            chatWidgetAlignment === "left" ? "left-6" : "right-6"
          )}
        >
          <Phone className="w-6 h-6" />
          <span className={cn(
            "absolute bg-white text-foreground px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none",
            chatWidgetAlignment === "left" ? "left-full ml-4" : "right-full mr-4"
          )}>
            WhatsApp us
          </span>
        </a>
      )}

      {/* Live Chat Widget */}
      {showChat && (
        <ChatWidget
          color={chatWidgetColor}
          alignment={chatWidgetAlignment}
          withWhatsapp={showWhatsapp}
        />
      )}
    </div>
  );
}
