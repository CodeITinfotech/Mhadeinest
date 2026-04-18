import { useState } from "react";
import { useGetSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, Instagram, Facebook, Youtube, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

export default function Contact() {
  const { data: settings } = useGetSettings();

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const siteName = settings?.siteName || "Mhadeinest";
  const heroImage = settings?.heroImage || `${BASE}images/hero.png`;
  const mapUrl = (settings as any)?.locationMapUrl || "";
  const whatsappNumber = settings?.whatsappNumber || "";
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hello!%20I%20would%20like%20to%20get%20in%20touch%20with%20${encodeURIComponent(siteName)}.`
    : "#";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, whatsapp: form.phone, message: form.message || "Contact page inquiry" }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setError("Something went wrong. Please try WhatsApp or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HERO ── */}
      <section className="relative h-[52vh] min-h-[340px] overflow-hidden">
        <img
          src={heroImage}
          alt={siteName}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/65" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-secondary font-semibold text-sm uppercase tracking-widest mb-3"
          >
            We'd love to hear from you
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display font-bold text-3xl md:text-5xl text-white leading-tight"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/70 mt-3 text-base max-w-md"
          >
            Whether it's a booking, a question, or just a hello — we're here.
          </motion.p>
        </div>
      </section>

      {/* ── CONTACT INFO CARDS ── */}
      <section className="bg-primary py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: Phone,
              label: "Call / WhatsApp",
              value: whatsappNumber ? `+${whatsappNumber.replace(/\D/g, "")}` : "Contact us",
              href: whatsappLink,
            },
            {
              icon: Mail,
              label: "Email Us",
              value: settings?.inquiryEmail || "bookings@example.com",
              href: settings?.inquiryEmail ? `mailto:${settings.inquiryEmail}` : "#",
            },
            {
              icon: MapPin,
              label: "Find Us",
              value: (settings as any)?.mapDescription || "Goa, India",
              href: mapUrl ? "#map" : "#",
            },
          ].map(({ icon: Icon, label, value, href }, i) => (
            <motion.a
              key={label}
              href={href}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="group flex flex-col items-center text-center gap-3 bg-primary-foreground/8 hover:bg-secondary/10 border border-primary-foreground/10 rounded-2xl p-6 transition-colors cursor-pointer"
            >
              <span className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center group-hover:bg-secondary/25 transition-colors">
                <Icon className="w-5 h-5 text-secondary" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/50">{label}</p>
              <p className="text-primary-foreground font-semibold text-sm leading-snug">{value}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── FORM + MAP ── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-secondary font-semibold text-xs uppercase tracking-widest mb-2">Send a Message</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">Let's Plan Your Stay</h2>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              Fill in your details and we'll get back to you within a few hours — via WhatsApp or email, whichever you prefer.
            </p>

            {success ? (
              <div className="flex flex-col items-center gap-4 text-center py-12 px-8 rounded-2xl border border-border bg-muted/30">
                <CheckCircle className="w-12 h-12 text-secondary" />
                <h3 className="font-display font-bold text-xl text-foreground">Message Received!</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Thank you for reaching out. We'll be in touch with you shortly on WhatsApp or email.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email Address <span className="text-destructive">*</span></label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone / WhatsApp</label>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your plans, preferred dates, number of guests, or any questions..."
                    className="min-h-[130px] resize-none"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 gap-2 font-semibold"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? "Sending…" : "Send Message"}
                  </Button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5a] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              </form>
            )}
          </motion.div>

          {/* Map + Info */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-secondary font-semibold text-xs uppercase tracking-widest mb-2">Location</p>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-1">Find Us Here</h2>
              <p className="text-muted-foreground text-sm">
                {(settings as any)?.mapDescription || "Click the map to open in Google Maps and get directions."}
              </p>
            </div>

            {mapUrl ? (
              <div id="map" className="rounded-2xl overflow-hidden border border-border shadow-sm aspect-[4/3]">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted/30 aspect-[4/3] flex items-center justify-center text-muted-foreground text-sm gap-2">
                <MapPin className="w-5 h-5" />
                Map not configured — add a Google Maps embed URL in admin settings
              </div>
            )}

            {/* Social links */}
            {(settings?.socialInstagram || settings?.socialFacebook || settings?.socialYoutube) && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">Follow us</span>
                {settings?.socialInstagram && (
                  <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.socialFacebook && (
                  <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.socialYoutube && (
                  <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
