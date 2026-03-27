import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Goa Houseboat"),
  tagline: text("tagline").notNull().default("Luxury Floating Experience in Goa"),
  heroTitle: text("hero_title").notNull().default("Experience Goa From The Water"),
  heroSubtitle: text("hero_subtitle").notNull().default("Luxury houseboat stay with 3 private bedrooms, rooftop dining, and thrilling water activities"),
  heroImage: text("hero_image").notNull().default(""),
  whatsappNumber: text("whatsapp_number").notNull().default("919876543210"),
  inquiryEmail: text("inquiry_email").notNull().default("booking@goahouseboat.com"),
  socialInstagram: text("social_instagram"),
  socialFacebook: text("social_facebook"),
  socialYoutube: text("social_youtube"),
  trailVideoUrl: text("trail_video_url"),
  aboutText: text("about_text").notNull().default("Welcome to our luxury houseboat experience in Goa. Nestled on the serene backwaters, our houseboat offers an unparalleled blend of comfort and adventure. With 3 beautifully appointed bedrooms, a rooftop restaurant with live cooking, and a range of exciting water activities, we promise memories that will last a lifetime."),
  aboutImages: text("about_images").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminUser = typeof adminUsersTable.$inferSelect;
