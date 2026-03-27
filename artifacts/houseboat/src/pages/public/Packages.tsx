import { motion } from "framer-motion";
import { useListPackages, useGetSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Check, Users } from "lucide-react";

export default function Packages() {
  const { data: packages = [], isLoading } = useListPackages();
  const { data: settings } = useGetSettings();

  const activePackages = packages.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="pt-24 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-5xl font-display font-bold text-primary mb-6">Our Packages</h1>
          <p className="text-lg text-muted-foreground">
            Whether you're planning a romantic getaway, a family vacation, or a private party, 
            we have the perfect package to make your stay unforgettable.
          </p>
        </div>

        <div className="space-y-16">
          {activePackages.map((pkg, idx) => {
            const isEven = idx % 2 === 0;
            const whatsappMsg = `Hi! I want to book the ${pkg.name} package for ${formatPrice(pkg.pricePerNight)}/night.`;
            const waUrl = settings?.whatsappNumber 
              ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
              : "#";

            return (
              <motion.div 
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
              >
                <div className="w-full lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative">
                  <img 
                    src={pkg.images?.[0] || `${import.meta.env.BASE_URL}images/bedroom.png`} 
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-bold text-primary">Up to {pkg.capacity} Guests</span>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2">
                  <h2 className="text-4xl font-display font-bold text-primary mb-4">{pkg.name}</h2>
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-secondary">{formatPrice(pkg.pricePerNight)}</span>
                    <span className="text-lg text-muted-foreground">/ per night</span>
                  </div>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {pkg.description}
                  </p>
                  
                  <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border">
                    <h3 className="font-display font-bold text-lg mb-4 text-primary">What's Included</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pkg.inclusions?.map((inclusion, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <div className="mt-1 bg-secondary/20 p-1 rounded-full text-secondary">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-full px-10 text-lg w-full sm:w-auto">
                      Book via WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
