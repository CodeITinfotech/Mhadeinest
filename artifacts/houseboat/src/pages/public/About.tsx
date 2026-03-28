import { useGetSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Play } from "lucide-react";

export default function About() {
  const { data: settings } = useGetSettings();

  const mapUrl = (settings as any)?.locationMapUrl || "";
  const trailVideoUrl = settings?.trailVideoUrl || "";

  return (
    <div className="pt-24 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-16">
          <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-3">Find Us</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">Our Story & Location</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the rich heritage of Goan backwaters aboard our meticulously crafted wooden houseboat.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg text-muted-foreground"
          >
            <h2 className="text-3xl font-display font-bold text-primary mb-6">The Floating Haven</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {settings?.aboutText || "Built by master craftsmen using traditional methods, our houseboat represents a perfect synergy between cultural heritage and modern luxury. Cruising through the serene backwaters of Goa, it offers a unique vantage point to witness the vibrant local ecosystem and untouched natural beauty."}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We pride ourselves on offering a sustainable yet lavish experience. Our dedicated crew ensures your every need is met, from gourmet dining on the rooftop deck to guiding you through hidden waterways on kayaks.
            </p>
          </motion.div>

          {/* Map embed — only shown when configured */}
          {mapUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border aspect-[4/3] bg-muted/30 relative">
                <iframe
                  src={mapUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shubhangi The Boat House Location"
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="w-4 h-4 text-primary shrink-0" />
                <span>Chapora River, North Goa — Click the map to get directions</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Trail Video Section */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-16 border border-border text-center">
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            {settings?.trailTitle || "Our Trail"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            {settings?.trailDescription || "Take a virtual tour of our regular cruise route. Watch as we navigate through mangroves, local fishing villages, and open waters."}
          </p>

          <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            {trailVideoUrl ? (
              <iframe
                src={trailVideoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Houseboat trail video"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-white/50">
                <img
                  src={`${import.meta.env.BASE_URL}images/about.png`}
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                  alt="Houseboat"
                />
                <div className="z-10 bg-black/60 p-6 rounded-full backdrop-blur-sm border border-white/20">
                  <Play className="w-12 h-12 text-white ml-1" fill="currentColor" />
                </div>
                <p className="z-10 mt-4 font-medium">Video Tour — Coming Soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
