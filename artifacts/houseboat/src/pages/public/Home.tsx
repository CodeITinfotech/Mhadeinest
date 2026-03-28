import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGetSettings, useListPackages } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Anchor, Wind, Sun, Coffee } from "lucide-react";
import { AvailabilitySearch } from "@/components/AvailabilitySearch";
import { useCurrency } from "@/context/CurrencyContext";

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: packages = [] } = useListPackages();
  const { fmt } = useCurrency();

  const heroImage = settings?.heroImage || `${import.meta.env.BASE_URL}images/hero.png`;

  return (
    <div className="flex flex-col">
      {/* Hero Section — widget lives inside at 45% */}
      <section className="relative h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Goa Houseboat Hero"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
        </div>

        {/* Hero text — tight block in the upper 38% */}
        <div className="absolute top-[7%] left-0 right-0 z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 leading-tight drop-shadow-lg"
          >
            {settings?.heroTitle || "Escape to Luxury"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-white/85 mb-5 font-light drop-shadow-md max-w-xl mx-auto"
          >
            {settings?.heroSubtitle || "Experience the serene backwaters of Goa in our premium 3-bedroom wooden houseboat."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/packages">
              <Button size="default" className="w-full sm:w-auto px-7 py-2.5 rounded-full">
                View Packages
              </Button>
            </Link>
            <Button
              size="default"
              variant="outline"
              className="w-full sm:w-auto px-7 py-2.5 rounded-full text-white border-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Discover More
            </Button>
          </motion.div>
        </div>

        {/* Availability Search — bottom on mobile, centred at 45% on desktop */}
        <div className="absolute bottom-6 md:bottom-auto md:top-[45%] md:-translate-y-1/2 left-0 right-0 z-20 px-4">
          <AvailabilitySearch />
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-white py-12 border-b border-muted">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Anchor, title: "Premium Stay", desc: "3 Luxurious Bedrooms" },
            { icon: Wind, title: "Water Sports", desc: "Kayaking & Speed Boating" },
            { icon: Sun, title: "Scenic Views", desc: "Golden Hour Sunsets" },
            { icon: Coffee, title: "Gourmet Dining", desc: "Live Rooftop Restaurant" },
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <feature.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section id="about" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-secondary uppercase mb-3">Welcome Aboard</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6 leading-tight">
              A Floating Paradise in the Heart of Goa
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {settings?.aboutText ? settings.aboutText.substring(0, 250) + "..." : "Immerse yourself in the tranquility of Goa's backwaters. Our premium wooden houseboat offers an unparalleled blend of traditional charm and modern luxury. With three exquisitely designed bedrooms, a rooftop restaurant, and thrilling water activities, your perfect getaway awaits."}
            </p>
            <Link href="/about">
              <Button variant="outline" className="rounded-full px-8">Read Our Story</Button>
            </Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={`${import.meta.env.BASE_URL}images/about.png`} 
                alt="Houseboat exterior" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl max-w-xs hidden md:block">
              <p className="font-display text-xl font-bold text-primary">"An unforgettable magical experience."</p>
              <div className="flex items-center gap-2 mt-2 text-secondary">
                {"★★★★★".split("").map((star, i) => <span key={i}>{star}</span>)}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-secondary uppercase mb-3">Our Offerings</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-primary">Choose Your Experience</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.filter(p => p.isActive).slice(0, 3).map((pkg, idx) => (
              <motion.div 
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border group hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img 
                    src={pkg.images?.[0] || `${import.meta.env.BASE_URL}images/bedroom.png`} 
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-primary font-bold text-sm shadow-sm">
                    Up to {pkg.capacity} Guests
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-display font-bold text-primary mb-2">{pkg.name}</h4>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-end justify-between mt-auto pt-6 border-t border-muted">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">From</p>
                      <p className="text-2xl font-bold text-secondary">{fmt(pkg.pricePerNight)}<span className="text-sm text-muted-foreground font-normal">/night</span></p>
                    </div>
                    <Link href="/packages">
                      <Button variant="outline" className="rounded-full">Details</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/packages">
              <Button size="lg" className="rounded-full px-10">View All Packages</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
