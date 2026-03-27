import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListPackages } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays, Users, Baby, ChevronDown, CheckCircle, AlertCircle, XCircle, Loader2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInquiryModal } from "@/hooks/use-inquiry-modal";

const API = import.meta.env.BASE_URL + "api";

interface AvailabilityResult {
  date: string;
  available: boolean;
  bookingCount: number;
  totalGuests: number;
  maxGuests: number;
  status: "available" | "limited" | "full";
}

function Counter({ value, onChange, min = 0, max = 20, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg font-bold text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >−</button>
      <span className="w-8 text-center font-bold text-foreground text-lg">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg font-bold text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >+</button>
    </div>
  );
}

export function AvailabilitySearch() {
  const { data: packages = [] } = useListPackages();
  const { open: openInquiry } = useInquiryModal();

  const [packageService, setPackageService] = useState("");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = async () => {
    if (!date) { setError("Please select a date."); return; }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/bookings/availability?date=${date}`);
      if (!res.ok) throw new Error("Failed to check availability");
      const data: AvailabilityResult = await res.json();
      setResult(data);
    } catch {
      setError("Could not check availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    available: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      label: "Available!",
      desc: "Great news — this date is open for bookings.",
    },
    limited: {
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      label: "Limited Availability",
      desc: "Some slots are taken for this date. Contact us to confirm your spot.",
    },
    full: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      label: "Fully Booked",
      desc: "This date is fully booked. Try another date or contact us for alternatives.",
    },
  };

  return (
    <section className="relative z-30 -mt-8 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden"
        >
          {/* Title strip */}
          <div className="bg-primary px-6 py-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary-foreground/80" />
            <span className="text-sm font-semibold text-primary-foreground tracking-wide uppercase">Check Availability</span>
          </div>

          {/* Search fields */}
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

              {/* Package / Service */}
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  Package / Service
                  <span className="text-[10px] font-normal text-muted-foreground/60">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={packageService}
                    onChange={e => setPackageService(e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none text-foreground"
                  >
                    <option value="">Any Package</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Date */}
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Check-in Date
                </label>
                <Input
                  type="date"
                  value={date}
                  min={today}
                  onChange={e => { setDate(e.target.value); setResult(null); setError(""); }}
                  className="h-11 rounded-xl border-input focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>

              {/* Adults */}
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Adults
                </label>
                <div className="h-11 flex items-center px-3 rounded-xl border border-input bg-background">
                  <Counter value={adults} onChange={setAdults} min={1} max={20} label="Adults" />
                </div>
              </div>

              {/* Kids */}
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5" /> Kids
                  <span className="text-[10px] font-normal text-muted-foreground/60">(under 12)</span>
                </label>
                <div className="h-11 flex items-center px-3 rounded-xl border border-input bg-background">
                  <Counter value={kids} onChange={setKids} min={0} max={20} label="Kids" />
                </div>
              </div>

              {/* Search button */}
              <div className="md:col-span-1">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  className="w-full h-11 rounded-xl gap-2 text-sm font-semibold"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                    : <><Search className="w-4 h-4" /> Check Now</>
                  }
                </Button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-3 text-sm text-destructive flex items-center gap-1.5">
                <XCircle className="w-4 h-4 shrink-0" />{error}
              </p>
            )}
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const cfg = statusConfig[result.status];
                  const Icon = cfg.icon;
                  return (
                    <div className={cn("mx-5 mb-5 rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4", cfg.bg)}>
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className={cn("w-6 h-6 shrink-0", cfg.color)} />
                        <div>
                          <p className={cn("font-bold text-base", cfg.color)}>{cfg.label}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{cfg.desc}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(result.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            {packageService && <> · {packageService}</>}
                            {" · "}{adults} adult{adults !== 1 ? "s" : ""}{kids > 0 ? `, ${kids} kid${kids !== 1 ? "s" : ""}` : ""}
                          </p>
                        </div>
                      </div>
                      {result.status !== "full" && (
                        <Button
                          size="sm"
                          className="shrink-0 gap-1.5 rounded-lg"
                          onClick={() => openInquiry({ packageService, checkIn: date, adults: String(adults), kids: String(kids) })}
                        >
                          <MessageSquareText className="w-4 h-4" />
                          Inquire Now
                        </Button>
                      )}
                      {result.status === "full" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1.5 rounded-lg"
                          onClick={() => openInquiry({ packageService, adults: String(adults), kids: String(kids) })}
                        >
                          <MessageSquareText className="w-4 h-4" />
                          Ask Alternatives
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
