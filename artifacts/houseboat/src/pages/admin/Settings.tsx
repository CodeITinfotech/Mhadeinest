import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Globe, User, Shield, Mail, Phone, Lock,
  KeyRound, BadgeCheck, CalendarDays, Loader2, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

type Tab = "site" | "profile";

// ─── Site settings schema ──────────────────────────────────────────────
const siteSchema = z.object({
  siteName: z.string().min(1),
  tagline: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroImage: z.string(),
  whatsappNumber: z.string(),
  inquiryEmail: z.string().email(),
  socialInstagram: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialYoutube: z.string().optional(),
  trailVideoUrl: z.string().optional(),
  aboutText: z.string(),
  aboutImages: z.string(),
});

// ─── Profile schema ────────────────────────────────────────────────────
const profileSchema = z.object({
  displayName: z.string(),
  email: z.string().email("Must be a valid email").or(z.literal("")),
  phone: z.string(),
  username: z.string().min(3, "Min 3 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string().min(1, "Required"),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface AdminProfile {
  id: number;
  username: string;
  role: string;
  displayName: string;
  email: string;
  phone: string;
  createdAt: string;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("site");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Site settings form ──────────────────────────────────────────────
  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Saved", description: "Site settings updated successfully." });
      }
    }
  });

  const siteForm = useForm<z.infer<typeof siteSchema>>({ resolver: zodResolver(siteSchema) });

  useEffect(() => {
    if (settings) {
      siteForm.reset({
        siteName: settings.siteName,
        tagline: settings.tagline,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroImage: settings.heroImage,
        whatsappNumber: settings.whatsappNumber,
        inquiryEmail: settings.inquiryEmail,
        socialInstagram: settings.socialInstagram || "",
        socialFacebook: settings.socialFacebook || "",
        socialYoutube: settings.socialYoutube || "",
        trailVideoUrl: settings.trailVideoUrl || "",
        aboutText: settings.aboutText,
        aboutImages: settings.aboutImages?.join(", ") || "",
      });
    }
  }, [settings, siteForm]);

  const onSiteSubmit = (data: z.infer<typeof siteSchema>) => {
    updateMutation.mutate({
      data: {
        ...data,
        aboutImages: data.aboutImages ? data.aboutImages.split(",").map(s => s.trim()) : [],
      }
    });
  };

  // ─── Profile form ────────────────────────────────────────────────────
  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    fetch(`${API}/auth/me`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(data);
          profileForm.reset({
            displayName: data.displayName || "",
            email: data.email || "",
            phone: data.phone || "",
            username: data.username || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setProfileSaving(true);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update");
      setProfile(prev => prev ? { ...prev, ...result.user } : prev);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setPasswordSaving(true);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update");
      passwordForm.reset();
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs = [
    { key: "site" as Tab, label: "Site Settings", icon: Globe },
    { key: "profile" as Tab, label: "Admin Profile", icon: User },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === key
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── SITE SETTINGS TAB ─────────────────────────────────────── */}
      {activeTab === "site" && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Site Settings</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your website content and contact information</p>
            </div>
            <Button onClick={siteForm.handleSubmit(onSiteSubmit)} disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>

          {isLoading ? <div className="text-muted-foreground">Loading settings...</div> : (
            <form className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-base border-b border-border pb-3">General & Hero</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Site Name"><Input {...siteForm.register("siteName")} /></Field>
                  <Field label="Tagline (Footer)"><Input {...siteForm.register("tagline")} /></Field>
                  <Field label="Hero Title"><Input {...siteForm.register("heroTitle")} /></Field>
                  <Field label="Hero Subtitle"><Input {...siteForm.register("heroSubtitle")} /></Field>
                  <Field label="Hero Image URL" className="md:col-span-2"><Input {...siteForm.register("heroImage")} /></Field>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-base border-b border-border pb-3">Contact & Social</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="WhatsApp Number (e.g. +919876543210)"><Input {...siteForm.register("whatsappNumber")} /></Field>
                  <Field label="Inquiry Email"><Input type="email" {...siteForm.register("inquiryEmail")} /></Field>
                  <Field label="Instagram URL"><Input {...siteForm.register("socialInstagram")} /></Field>
                  <Field label="Facebook URL"><Input {...siteForm.register("socialFacebook")} /></Field>
                  <Field label="YouTube URL"><Input {...siteForm.register("socialYoutube")} /></Field>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-base border-b border-border pb-3">About & Trail Video</h3>
                <Field label="YouTube Trail Video URL"><Input {...siteForm.register("trailVideoUrl")} placeholder="https://youtube.com/watch?v=..." /></Field>
                <Field label="About Text"><Textarea {...siteForm.register("aboutText")} className="min-h-[140px]" /></Field>
                <Field label="About Images (comma-separated URLs)"><Textarea {...siteForm.register("aboutImages")} className="min-h-[80px]" /></Field>
              </div>
            </form>
          )}
        </>
      )}

      {/* ── ADMIN PROFILE TAB ─────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Admin Profile</h2>
            <p className="text-sm text-muted-foreground mt-0.5">View your account details and update your profile</p>
          </div>

          {profileLoading ? (
            <div className="flex items-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading profile...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT — Admin Details (read-only) */}
              <div className="space-y-4">
                {/* Avatar card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {(profile?.displayName || profile?.username || "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-foreground text-lg">{profile?.displayName || profile?.username}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {profile?.role?.charAt(0).toUpperCase()}{profile?.role?.slice(1)}
                  </span>
                </div>

                {/* Admin Details */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-1">Admin Details</h3>
                  <p className="text-xs text-muted-foreground mb-4">Your account information</p>
                  <div>
                    <InfoRow icon={User} label="Username" value={`@${profile?.username}`} />
                    <InfoRow icon={Shield} label="Role" value={profile?.role || ""} />
                    <InfoRow icon={Mail} label="Email" value={profile?.email || "Not set"} />
                    <InfoRow icon={Phone} label="Phone" value={profile?.phone || "Not set"} />
                    <InfoRow icon={CalendarDays} label="Member Since" value={
                      profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                        : ""
                    } />
                  </div>
                </div>
              </div>

              {/* RIGHT — Edit forms */}
              <div className="lg:col-span-2 space-y-6">

                {/* User Details (editable profile) */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-foreground">User Details</h3>
                  </div>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Display Name">
                        <Input {...profileForm.register("displayName")} placeholder="Your full name" />
                      </Field>
                      <Field label="Username" error={profileForm.formState.errors.username?.message}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                          <Input {...profileForm.register("username")} className="pl-7" placeholder="admin" />
                        </div>
                      </Field>
                      <Field label="Email Address" error={profileForm.formState.errors.email?.message}>
                        <Input type="email" {...profileForm.register("email")} placeholder="admin@example.com" />
                      </Field>
                      <Field label="Phone Number">
                        <Input {...profileForm.register("phone")} placeholder="+91 98765 43210" />
                      </Field>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={profileForm.handleSubmit(onProfileSubmit)} disabled={profileSaving} className="gap-2">
                        {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update Profile
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Admin Setting — Change Password */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-foreground">Admin Settings</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">Change your login password. You'll need to know your current password.</p>
                  <form className="space-y-4">
                    <Field label="Current Password" error={passwordForm.formState.errors.currentPassword?.message}>
                      <div className="relative">
                        <Input
                          type={showCurrent ? "text" : "password"}
                          {...passwordForm.register("currentPassword")}
                          placeholder="Enter current password"
                          className="pr-10"
                        />
                        <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="New Password" error={passwordForm.formState.errors.newPassword?.message}>
                        <div className="relative">
                          <Input
                            type={showNew ? "text" : "password"}
                            {...passwordForm.register("newPassword")}
                            placeholder="Min 6 characters"
                            className="pr-10"
                          />
                          <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>
                      <Field label="Confirm New Password" error={passwordForm.formState.errors.confirmPassword?.message}>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            {...passwordForm.register("confirmPassword")}
                            placeholder="Repeat new password"
                            className="pr-10"
                          />
                          <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        onClick={passwordForm.handleSubmit(onPasswordSubmit)}
                        disabled={passwordSaving}
                        className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Change Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, error, className }: { label: string; children: React.ReactNode; error?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
