import { useGetSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function About() {
  const { data: settings } = useGetSettings();

  return (
    <div className="pt-24 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold text-primary mb-6">Our Story & Trail</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the rich heritage of Goan backwaters aboard our meticulously crafted wooden houseboat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg text-muted-foreground"
          >
            <h2 className="text-3xl font-display font-bold text-primary mb-6">The Floating Haven</h2>
            <p>
              {settings?.aboutText || "Built by master craftsmen using traditional methods, our houseboat represents a perfect synergy between cultural heritage and modern luxury. Cruising through the serene backwaters of Goa, it offers a unique vantage point to witness the vibrant local ecosystem and untouched natural beauty."}
            </p>
            <p>
              We pride ourselves on offering a sustainable yet lavish experience. Our dedicated crew ensures your every need is met, from gourmet dining on the rooftop deck to guiding you through hidden waterways on kayaks.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {settings?.aboutImages && settings.aboutImages.length > 0 ? (
              settings.aboutImages.slice(0, 2).map((img, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden shadow-lg ${i === 1 ? 'mt-8' : ''}`}>
                  <img src={img} alt="About" className="w-full h-full object-cover aspect-[3/4]" />
                </div>
              ))
            ) : (
              <>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  {/* using unsplash placeholder if no settings images exist */}
                  {/* beautiful wooden houseboat interior */}
                  <img src="https://pixabay.com/get/g67ece76801561edc75e6120c2018125d90792fe0508963cd105545c87de9a549edcd90bf6191c8d4a72b44a1655e55eed40d434467cc3a0fad13c28e662a07fc_1280.jpg" alt="Interior" className="w-full h-full object-cover aspect-[3/4]" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg mt-8">
                  {/* goan backwaters sunset */}
                  <img src="https://pixabay.com/get/gfe92ad5810c064eb2b0a057a027fe7afaf94e3ebc8f4e64025da448e15c880f9a01246cfd4da4fc3ad845891b843d0d73021bcd6f21eb610b479738821de84f6_1280.jpg" alt="Exterior" className="w-full h-full object-cover aspect-[3/4]" />
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Trail Video Section */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-16 border border-border text-center">
          <h2 className="text-3xl font-display font-bold text-primary mb-4">The Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Take a virtual tour of our regular cruise route. Watch as we navigate through mangroves, local fishing villages, and open waters.
          </p>
          
          <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            {settings?.trailVideoUrl ? (
              <iframe 
                src={settings.trailVideoUrl.replace("watch?v=", "embed/")} 
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-white/50">
                <img src={`${import.meta.env.BASE_URL}images/about.png`} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="z-10 bg-black/60 p-6 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/80 transition-colors border border-white/20">
                  <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="z-10 mt-4 font-medium">Video Tour Available Soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
