import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  startWeight: decimal("start_weight", { precision: 5, scale: 2 }),
  goalWeight: decimal("goal_weight", { precision: 5, scale: 2 }),
  weightUnit: text("weight_unit").notNull().default("lbs"),
  hasCompletedOnboarding: text("has_completed_onboarding").notNull().default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightEntries = pgTable("weight_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("lbs"),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "semaglutide", "tirzepatide", etc.
  currentDose: decimal("current_dose", { precision: 4, scale: 2 }).notNull(),
  targetDose: decimal("target_dose", { precision: 4, scale: 2 }),
  unit: text("unit").notNull().default("mg"),
  frequency: text("frequency").notNull().default("weekly"),
  startDate: timestamp("start_date").notNull(),
  nextDoseDate: timestamp("next_dose_date"),
  titrationSchedule: jsonb("titration_schedule"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const injectionLogs = pgTable("injection_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  medicationId: varchar("medication_id").references(() => medications.id).notNull(),
  dose: decimal("dose", { precision: 4, scale: 2 }).notNull(),
  unit: text("unit").notNull().default("mg"),
  injectionSite: text("injection_site"),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataImports = pgTable("data_imports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  sourceApp: text("source_app"), // "myfitnesspal", "loseit", etc.
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  parsedData: jsonb("parsed_data"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertInjectionLogSchema = createInsertSchema(injectionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDataImportSchema = createInsertSchema(dataImports).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;

export type InjectionLog = typeof injectionLogs.$inferSelect;
export type InsertInjectionLog = z.infer<typeof insertInjectionLogSchema>;

export type DataImport = typeof dataImports.$inferSelect;
export type InsertDataImport = z.infer<typeof insertDataImportSchema>;
