import { useParams, Link } from "wouter";
import { useListActivities } from "@workspace/api-client-react";
import { useGetSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { ArrowLeft, ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInquiryModal } from "@/context/InquiryModalContext";

const BASE = import.meta.env.BASE_URL;

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: activities = [], isLoading } = useListActivities();
  const { data: settings } = useGetSettings();
  const { open: openInquiry } = useInquiryModal();

  const activityId = Number(id);
  const activity = activities.find(a => a.id === activityId);
  const activeActivities = activities.filter(a => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const related = activeActivities.filter(a => a.id !== activityId).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-2xl font-display font-bold text-foreground">Activity Not Found</p>
        <p className="text-muted-foreground text-sm">This activity may have been removed or the link is incorrect.</p>
        <Link href="/activities">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Activities
          </Button>
        </Link>
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[activity.icon] || LucideIcons.Activity;
  const siteName = settings?.siteName || "Mhadeinest";

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ── */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        {activity.image ? (
          <img
            src={activity.image}
            alt={activity.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={`${BASE}images/activities.png`}
            alt={activity.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />

        {/* Back button */}
        <Link href="/activities">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-28 left-6 z-20 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> All Activities
          </motion.button>
        </Link>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="w-16 h-16 rounded-2xl bg-secondary/20 backdrop-blur-sm border border-secondary/30 flex items-center justify-center mb-5"
          >
            <IconComponent className="w-8 h-8 text-secondary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="font-display font-bold text-3xl md:text-5xl text-white leading-tight max-w-3xl"
          >
            {activity.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-xs uppercase tracking-widest mt-3"
          >
            {siteName} · Experience
          </motion.p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="prose prose-lg max-w-none text-foreground"
          >
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-line">
              {activity.description}
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="gap-2 font-semibold"
              onClick={() => openInquiry({ packageName: activity.name })}
            >
              <CalendarCheck className="w-5 h-5" />
              Inquire About This Activity
            </Button>
            <Link href="/activities">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" /> Browse All Activities
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── RELATED ACTIVITIES ── */}
      {related.length > 0 && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-secondary font-semibold text-xs uppercase tracking-widest mb-1">More to Explore</p>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">Other Activities</h2>
              </div>
              <Link href="/activities">
                <span className="text-sm text-secondary font-semibold hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((a, idx) => {
                const RelIcon = (LucideIcons as any)[a.icon] || LucideIcons.Activity;
                return (
                  <Link key={a.id} href={`/activities/${a.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08 }}
                      className="group bg-card rounded-2xl p-6 border border-border hover:border-secondary/50 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
                        <RelIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-base text-foreground mb-2 group-hover:text-secondary transition-colors">{a.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{a.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-secondary text-xs font-semibold">
                        Read more <ArrowRight className="w-3 h-3" />
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
