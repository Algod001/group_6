import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  healthcareNumber: text("healthcare_number"),
});

export const bloodSugarReadings = pgTable("blood_sugar_readings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").notNull(),
  value: numeric("value").notNull(),
  measuredAt: timestamp("measured_at").notNull(),
  category: text("category").notNull(),
  foodIntake: text("food_intake"),
  activity: text("activity"),
  notes: text("notes"),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").notNull(),
  advice: text("advice").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const insertBloodSugarReadingSchema = createInsertSchema(bloodSugarReadings).omit({
  id: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type BloodSugarReading = typeof bloodSugarReadings.$inferSelect;
export type InsertBloodSugarReading = z.infer<typeof insertBloodSugarReadingSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
