
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// 36 Cycles of 10 days each
export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  cycleNumber: integer("cycle_number").notNull(), // 1 to 36
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: text("goal"), // Main goal for this 10-day cycle
  status: text("status").notNull().default("upcoming"), // upcoming, active, completed
});

// Days within a cycle (1-10)
export const days = pgTable("days", {
  id: serial("id").primaryKey(),
  cycleId: integer("cycle_id").notNull(),
  dayNumber: integer("day_number").notNull(), // 1 to 10
  date: timestamp("date").notNull(),
  goal: text("goal"), // Specific goal for this day
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
});

// Granular tasks for a specific day
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").notNull(),
  content: text("content").notNull(),
  isCompleted: boolean("is_completed").default(false),
});

// Pre-filled reminders based on the day of the cycle (1-10)
export const reminderTemplates = pgTable("reminder_templates", {
  id: serial("id").primaryKey(),
  dayNumber: integer("day_number").notNull(), // 1 to 10
  message: text("message").notNull(),
});

// Alarm settings for notifications
export const alarms = pgTable("alarms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  time: text("time").notNull(), // HH:mm format
  isEnabled: boolean("is_enabled").default(true),
  repeatDays: text("repeat_days").array(), // ['Mon', 'Tue', etc] or empty for daily
  message: text("message"), // Custom alarm message
  sound: text("sound").default("default"), // Sound type
});

// === RELATIONS ===
export const cyclesRelations = relations(cycles, ({ many }) => ({
  days: many(days),
}));

export const daysRelations = relations(days, ({ one, many }) => ({
  cycle: one(cycles, {
    fields: [days.cycleId],
    references: [cycles.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  day: one(days, {
    fields: [tasks.dayId],
    references: [days.id],
  }),
}));

// === SCHEMAS ===
export const insertCycleSchema = createInsertSchema(cycles).omit({ id: true });
export const insertDaySchema = createInsertSchema(days).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertReminderTemplateSchema = createInsertSchema(reminderTemplates).omit({ id: true });
export const insertAlarmSchema = createInsertSchema(alarms).omit({ id: true });

// === EXPORTED TYPES ===
export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;

export type Day = typeof days.$inferSelect;
export type InsertDay = z.infer<typeof insertDaySchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type ReminderTemplate = typeof reminderTemplates.$inferSelect;

export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = z.infer<typeof insertAlarmSchema>;

// Request Types
export type UpdateCycleRequest = Partial<InsertCycle>;
export type UpdateDayRequest = Partial<InsertDay>;
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateAlarmRequest = InsertAlarm;
export type UpdateAlarmRequest = Partial<InsertAlarm>;
