import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetSettings, useListPackages, useListActivities } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Anchor, Wind, Sun, Coffee, ChevronDown, ArrowRight, Waves, Star, MapPin } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { AvailabilitySearch } from "@/components/AvailabilitySearch";
import { useCurrency } from "@/context/CurrencyContext";
import { useInquiryModal } from "@/context/InquiryModalContext";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL;

interface Faq { id: number; question: string; answer: string; isActive: boolean; sortOrder: number; }

const FALLBACK_FEATURES = [
  { icon: Anchor, title: "3 Luxury Bedrooms", desc: "Private en-suite rooms with deck access and river views." },
  { icon: Wind, title: "Water Adventures", desc: "Kayaking, speed boating, and sunset river cruises." },
  { icon: Sun, title: "Golden Hour Views", desc: "Watch Goa's sky turn amber from your private rooftop." },
  { icon: Coffee, title: "Rooftop Dining", desc: "Live Goan cuisine prepared fresh, right on the water." },
];

const EXPLORE_CATEGORIES = [
  { label: "Luxury Rooms", image: `${BASE}images/room-luxury.jpg`, href: "/packages" },
  { label: "Dining & Cuisine", image: `${BASE}images/dining.png`, href: "/packages" },
  { label: "Water Activities", image: `${BASE}images/boating.jpg`, href: "/activities" },
  { label: "The Resort", image: `${BASE}images/resort2.jpg`, href: "/about" },
];

const FALLBACK_GALLERY = [
  `${BASE}images/gallery-1.jpg`,
  `${BASE}images/gallery-2.jpg`,
  `${BASE}images/gallery-3.jpg`,
  `${BASE}images/gallery-4.jpg`,
  `${BASE}images/gallery-5.jpg`,
  `${BASE}images/gallery-6.jpg`,
];

interface GalleryItem { id: number; imageUrl: string; isActive: boolean; sortOrder: number; }

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: packages = [] } = useListPackages();
  const { data: activities = [] } = useListActivities();
  const { fmt } = useCurrency();
  const { open: openInquiry } = useInquiryModal();
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const { data: allFaqs = [] } = useQuery<Faq[]>({
    queryKey: ["faqs-public"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/faqs`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: galleryItems = [] } = useQuery<GalleryItem[]>({
    queryKey: ["gallery-public-home"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/gallery`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const activeGalleryImages = galleryItems
    .filter(g => g.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 6)
    .map(g => g.imageUrl);
  const activeFaqs = allFaqs.filter(f => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const activeActivities = activities
    .filter((a) => a.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4);

  const heroImage = settings?.heroImage || `${BASE}images/hero.png`;

  useEffect(() => {
    if (window.location.hash === "#check-availability") {
      setTimeout(() => {
        const el = document.getElementById("check-availability");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const firstInput = el.querySelector("input, select, button");
          if (firstInput) (firstInput as HTMLElement).focus();
        }
      }, 400);
    }
  }, []);

  const activePackages = packages.filter(p => p.isActive).slice(0, 3);

  return (
    <div className="flex flex-col">

      {/* ─── HERO ─── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Mhadeinest — luxury river resort on the Goa backwaters"
            className="w-full h-full object-cover object-center"
          />
          {/* Lighter, more natural gradient — image earns its place */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/68" />
        </div>

        {/* Location tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="absolute top-[30%] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
        >
          <MapPin className="w-3.5 h-3.5 text-secondary" />
          <span className="text-white/80 text-xs font-medium tracking-[0.14em] uppercase">{(settings as any)?.heroLocationTag || "Mandovi River, Goa"}</span>
        </motion.div>

        {/* Hero headline block */}
        <div className="absolute top-[36%] left-0 right-0 z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-[3.75rem] font-display font-bold text-white mb-4 leading-[1.1] drop-shadow-md"
          >
            {settings?.heroTitle || "Experience Goa\nFrom the Water"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18 }}
            className="text-base md:text-lg text-white/78 mb-7 font-light drop-shadow max-w-lg mx-auto leading-relaxed"
          >
            {settings?.heroSubtitle || "A luxury river resort on Goa's backwaters — three private bedrooms, rooftop dining, and the river all to yourself."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/packages">
              <Button size="default" className="px-8 py-2.5 rounded-sm bg-secondary hover:bg-secondary/90 text-white font-semibold tracking-wide shadow-lg">
                View Packages
              </Button>
            </Link>
            <Button
              size="default"
              variant="ghost"
              className="px-8 py-2.5 rounded-sm text-white border border-white/40 hover:bg-white/12 hover:text-white backdrop-blur-sm font-medium"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Discover More
            </Button>
          </motion.div>
        </div>

        {/* Availability widget — anchored to bottom */}
        <div id="check-availability" className="absolute bottom-6 md:bottom-10 left-0 right-0 z-20 px-4">
          <AvailabilitySearch />
        </div>
      </section>

      {/* ─── FEATURES STRIP ─── */}
      <section className="bg-white py-14 border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
            {(activeActivities.length > 0 ? activeActivities : FALLBACK_FEATURES).map((item, idx) => {
              const Icon = activeActivities.length > 0
                ? ((LucideIcons as any)[(item as any).icon] || Waves)
                : (item as any).icon;
              const title = activeActivities.length > 0 ? (item as any).name : (item as any).title;
              const desc = activeActivities.length > 0 ? (item as any).description : (item as any).desc;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="flex flex-col items-center text-center px-6 py-8 group"
                >
                  <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-primary/8 group-hover:bg-primary/14 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-foreground mb-1.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── EXPLORE MHADEINEST ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-12">
            <div>
              <p className="text-secondary font-semibold text-xs uppercase tracking-[0.16em] mb-3">{(settings as any)?.exploreLabel || "Everything in One Place"}</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                {(settings as any)?.exploreTitle || "Explore Mhadeinest's Backwater Experience"}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              {(settings as any)?.exploreSubtitle || "From your first sunrise over the Mandovi to a candle-lit rooftop dinner, every moment aboard Mhadeinest is thoughtfully curated. Choose your experience below."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXPLORE_CATEGORIES.map((cat, idx) => (
              <motion.a
                key={cat.label}
                href={cat.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group overflow-hidden rounded-lg aspect-[3/4] block cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `${BASE}images/hero.png`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-display font-semibold text-base leading-tight">{cat.label}</p>
                  <span className="text-white/60 text-xs flex items-center gap-1 mt-1 group-hover:text-secondary transition-colors">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WELCOME / ABOUT ─── */}
      <section id="about" className="py-20 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-secondary font-semibold text-xs uppercase tracking-[0.16em] mb-3">{(settings as any)?.welcomeLabel || "Welcome Aboard"}</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-snug mb-6">
              {(settings as any)?.welcomeTitle || "A Floating Paradise in the Heart of Goa"}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[15px] mb-5">
              {settings?.aboutText
                ? settings.aboutText.substring(0, 260) + "..."
                : "Immerse yourself in the tranquility of Goa's backwaters with Mhadeinest. We offer an unparalleled blend of traditional charm and modern luxury — three exquisitely designed bedrooms, a rooftop restaurant, and thrilling water activities await."}
            </p>
            {/* Star rating */}
            <div className="flex items-center gap-2 mb-7">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />)}
              </div>
              <span className="text-sm text-muted-foreground font-medium">{(settings as any)?.welcomeRatingText || "5.0 · 200+ stays"}</span>
            </div>
            <Link href="/about">
              <Button variant="outline" className="rounded-sm px-8 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                Read Our Story
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
              <img
                src={(settings as any)?.welcomeImage || `${BASE}images/resort3.jpg`}
                alt="Mhadeinest resort on the Goa backwaters"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Floating review card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-lg shadow-lg max-w-[220px] hidden md:block border border-border/60">
              <p className="font-display text-sm font-semibold text-foreground leading-snug mb-2">
                "{(settings as any)?.welcomeReviewText || "An unforgettable experience on the water."}"
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">{(settings as any)?.welcomeReviewAttribution || "Verified guest · Goa, 2024"}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PACKAGES & DEALS ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-secondary font-semibold text-xs uppercase tracking-[0.16em] mb-3">{(settings as any)?.packagesLabel || "Our Offerings"}</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">{(settings as any)?.packagesTitle || "Packages & Deals"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePackages.length > 0 ? activePackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-card rounded-lg overflow-hidden border border-border group hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Clickable image area → navigates to the package detail */}
                <Link href={`/packages#package-${pkg.id}`} className="block">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={pkg.images?.[0] || `${BASE}images/room-luxury.jpg`}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-sm tracking-wide uppercase">
                      Up to {pkg.capacity} guests
                    </div>
                    {/* Hover overlay — "View Details" prompt */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-primary text-xs font-bold px-4 py-2 rounded-sm tracking-wide uppercase flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5" />
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-1">
                  <Link href={`/packages#package-${pkg.id}`} className="block mb-1.5">
                    <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">{pkg.name}</h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">{pkg.description}</p>
                  <div className="flex items-end justify-between pt-4 border-t border-border mt-auto">
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">From</p>
                      <p className="text-xl font-bold text-secondary font-sans">
                        {fmt(pkg.pricePerNight)}<span className="text-xs text-muted-foreground font-normal"> / night</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/packages#package-${pkg.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-sm border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold px-4"
                        >
                          Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold tracking-wide px-4"
                        onClick={(e) => { e.stopPropagation(); openInquiry({ packageService: pkg.name }); }}
                      >
                        Inquire
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              /* Skeleton placeholder while packages load */
              [0,1,2].map(i => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/packages">
              <Button variant="outline" className="rounded-sm px-10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                View All Packages <ArrowRight className="w-4 h-4 ml-2 inline-block" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PHOTO GALLERY ─── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-secondary font-semibold text-xs uppercase tracking-[0.16em] mb-3">{(settings as any)?.galleryLabel || "A Glimpse Inside"}</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">{(settings as any)?.galleryTitle || "Photo Gallery"}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(activeGalleryImages.length > 0 ? activeGalleryImages : FALLBACK_GALLERY).map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                className={`overflow-hidden rounded-lg group cursor-pointer ${idx === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              >
                <img
                  src={src}
                  alt={`Resort view ${idx + 1}`}
                  className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${idx === 0 ? "h-72 md:h-full" : "h-48"}`}
                />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/gallery">
              <Button variant="outline" className="rounded-sm px-8 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                View Full Gallery <ArrowRight className="w-4 h-4 ml-1 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── IMMERSIVE EXPERIENCE BANNER ─── */}
      <section className="relative py-0 overflow-hidden">
        <div className="relative h-[480px] md:h-[520px]">
          {/* Video background — shown when a video URL is configured */}
          {(settings as any)?.bannerVideoUrl ? (
            <>
              <video
                key={(settings as any).bannerVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center"
              >
                <source src={(settings as any).bannerVideoUrl} type="video/mp4" />
              </video>
              {/* Fallback poster image while video loads */}
              {(settings as any)?.bannerImage && (
                <img
                  src={(settings as any).bannerImage}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover object-center -z-10"
                />
              )}
            </>
          ) : (
            <img
              src={(settings as any)?.bannerImage || `${BASE}images/activities.png`}
              alt="Experience Mhadeinest"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-primary/82" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-secondary text-xs font-semibold uppercase tracking-[0.18em] mb-4"
            >
              {(settings as any)?.bannerLabel || "The Mhadeinest Way"}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-display font-bold text-white leading-tight max-w-2xl mb-5"
            >
              {(settings as any)?.bannerTitle || "Experience Goa Like You Never Have Before"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-white/68 text-base max-w-lg mb-8 leading-relaxed"
            >
              {(settings as any)?.bannerDescription || "Wake up on the river. Kayak at sunrise. Dine under the stars. Mhadeinest is your private floating retreat, away from the crowds."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="flex gap-4 flex-wrap justify-center"
            >
              <Link href="/packages">
                <Button className="rounded-sm bg-secondary hover:bg-secondary/90 text-white px-8 font-semibold tracking-wide shadow-lg">
                  Explore Packages
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="rounded-sm text-white border border-white/30 hover:bg-white/12 px-8 font-medium"
                onClick={() => openInquiry()}
              >
                Plan My Stay
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── ACTIVITIES ─── */}
      {activeActivities.length > 0 && (
        <section className="py-20 bg-muted/40">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-secondary font-semibold text-xs uppercase tracking-[0.16em] mb-3">What To Do</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                On-Board Activities & Experiences
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {activeActivities.map((activity, idx) => {
                const Icon = (LucideIcons as any)[activity.icon] || Waves;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-lg p-6 text-center border border-border hover:shadow-md transition-shadow group"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground mb-2">{activity.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{activity.description}</p>
                  </motion.div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/activities">
                <Button variant="outline" className="rounded-sm px-8 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                  All Activities <ArrowRight className="w-4 h-4 ml-1 inline" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      {activeFaqs.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-secondary font-semibold text-xs uppercase tracking-[0.16em] mb-3">Got Questions?</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="divide-y divide-border border border-border rounded-lg bg-card overflow-hidden">
              {activeFaqs.map((faq, idx) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium text-foreground text-[15px] leading-snug pr-2">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-1">
                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── KEEP IN TOUCH / CTA STRIP ─── */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
            Ready to Experience Mhadeinest?
          </h2>
          <p className="text-primary-foreground/65 mb-7 text-[15px]">
            Reach out to plan your stay — our team responds within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="rounded-sm bg-secondary hover:bg-secondary/90 text-white px-10 font-semibold tracking-wide shadow-lg"
              onClick={() => openInquiry()}
            >
              Send an Inquiry
            </Button>
            <Link href="/packages">
              <Button variant="ghost" className="rounded-sm text-white border border-white/30 hover:bg-white/12 px-10 font-medium">
                Browse Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
