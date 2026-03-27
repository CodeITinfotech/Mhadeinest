import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const settingsSchema = z.object({
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

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Saved", description: "Settings updated successfully." });
      }
    }
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema)
  });

  useEffect(() => {
    if (settings) {
      form.reset({
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
  }, [settings, form]);

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateMutation.mutate({
      data: {
        ...data,
        aboutImages: data.aboutImages ? data.aboutImages.split(",").map(s => s.trim()) : [],
      }
    });
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Site Settings</h2>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={updateMutation.isPending} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <form className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold border-b border-border pb-2">General & Hero</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name</label>
              <Input {...form.register("siteName")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline (Footer)</label>
              <Input {...form.register("tagline")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Hero Image URL</label>
              <Input {...form.register("heroImage")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Title</label>
              <Input {...form.register("heroTitle")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hero Subtitle</label>
              <Input {...form.register("heroSubtitle")} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold border-b border-border pb-2">Contact & Social</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Number (e.g. +919876543210)</label>
              <Input {...form.register("whatsappNumber")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Inquiry Email</label>
              <Input type="email" {...form.register("inquiryEmail")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram URL</label>
              <Input {...form.register("socialInstagram")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Facebook URL</label>
              <Input {...form.register("socialFacebook")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <Input {...form.register("socialYoutube")} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold border-b border-border pb-2">About & Trail</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube Video URL for Trail</label>
              <Input {...form.register("trailVideoUrl")} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">About Text</label>
              <Textarea {...form.register("aboutText")} className="min-h-[150px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">About Images (comma separated URLs)</label>
              <Textarea {...form.register("aboutImages")} className="min-h-[100px]" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
