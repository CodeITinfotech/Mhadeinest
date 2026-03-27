import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dining() {
  return (
    <div className="pt-24 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-5xl font-display font-bold text-primary mb-6">Culinary Journey</h1>
          <p className="text-lg text-muted-foreground">
            Experience exquisite dining on our top deck. From traditional Goan delicacies to international cuisine, 
            our live restaurant offers a feast for your senses while you float on serene waters.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-24"
        >
          <img 
            src={`${import.meta.env.BASE_URL}images/dining.png`} 
            alt="Dining on Houseboat" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">Rooftop Live Restaurant</h2>
            <p className="text-white/90 text-lg max-w-2xl">Dine under the stars with fresh sea breeze and panoramic views of the backwaters.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Breakfast", time: "8:00 AM - 10:30 AM", desc: "Start your day with a lavish spread of continental and Indian breakfast options, fresh juices, and Goan tea." },
            { title: "Brunch", time: "11:30 AM - 1:00 PM", desc: "Light bites, sandwiches, and refreshing tropical cocktails perfect for a midday relaxing session." },
            { title: "Lunch", time: "1:30 PM - 3:30 PM", desc: "Authentic Goan fish curry, fresh seafood catch of the day, and a variety of vegetarian delicacies." },
            { title: "Dinner", time: "7:30 PM - 10:30 PM", desc: "Romantic candle-lit dinner featuring a curated chef's menu, live grills, and premium wine selection." },
          ].map((meal, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card p-8 rounded-2xl shadow-lg border border-border hover:-translate-y-2 transition-transform duration-300 text-center"
            >
              <h3 className="text-2xl font-display font-bold text-primary mb-2">{meal.title}</h3>
              <p className="text-sm font-semibold text-secondary mb-4">{meal.time}</p>
              <p className="text-muted-foreground">{meal.desc}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 text-center bg-primary text-primary-foreground p-12 rounded-3xl">
          <h2 className="text-3xl font-display font-bold mb-4">Hosting a Private Party?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Our rooftop restaurant and bar can be entirely reserved for your private celebrations. 
            We offer custom menus, live music arrangements, and dedicated service staff.
          </p>
          <Link href="/packages">
            <Button variant="secondary" size="lg" className="rounded-full px-10">
              Inquire About Private Booking
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
