
import { db } from "./db";
import {
  cycles, days, tasks, reminderTemplates, alarms,
  type Cycle, type InsertCycle, type UpdateCycleRequest,
  type Day, type InsertDay, type UpdateDayRequest,
  type Task, type InsertTask, type UpdateTaskRequest,
  type ReminderTemplate,
  type Alarm, type InsertAlarm, type UpdateAlarmRequest
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // Cycles
  getCycles(): Promise<Cycle[]>;
  getCycle(id: number): Promise<(Cycle & { days: (Day & { tasks: Task[] })[] }) | undefined>;
  updateCycle(id: number, updates: UpdateCycleRequest): Promise<Cycle | undefined>;
  createCycles(cycles: InsertCycle[]): Promise<Cycle[]>;
  clearCycles(): Promise<void>; // To reset

  // Days
  getDay(id: number): Promise<(Day & { tasks: Task[] }) | undefined>;
  updateDay(id: number, updates: UpdateDayRequest): Promise<Day | undefined>;
  createDays(days: InsertDay[]): Promise<Day[]>;

  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: UpdateTaskRequest): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Reminders
  getReminders(): Promise<ReminderTemplate[]>;
  seedReminders(): Promise<void>; // Populate default reminders

  // Alarms
  getAlarms(): Promise<Alarm[]>;
  createAlarm(alarm: InsertAlarm): Promise<Alarm>;
  updateAlarm(id: number, updates: UpdateAlarmRequest): Promise<Alarm | undefined>;
  deleteAlarm(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCycles(): Promise<Cycle[]> {
    return await db.select().from(cycles).orderBy(asc(cycles.cycleNumber));
  }

  async getCycle(id: number): Promise<(Cycle & { days: (Day & { tasks: Task[] })[] }) | undefined> {
    const cycle = await db.query.cycles.findFirst({
      where: eq(cycles.id, id),
      with: {
        days: {
          orderBy: asc(days.dayNumber),
          with: {
            tasks: {
              orderBy: asc(tasks.id)
            }
          }
        }
      }
    });
    return cycle;
  }

  async updateCycle(id: number, updates: UpdateCycleRequest): Promise<Cycle | undefined> {
    const [updated] = await db.update(cycles)
      .set(updates)
      .where(eq(cycles.id, id))
      .returning();
    return updated;
  }

  async createCycles(newCycles: InsertCycle[]): Promise<Cycle[]> {
    return await db.insert(cycles).values(newCycles).returning();
  }

  async clearCycles(): Promise<void> {
    await db.delete(tasks);
    await db.delete(days);
    await db.delete(cycles);
  }

  async getDay(id: number): Promise<(Day & { tasks: Task[] }) | undefined> {
    return await db.query.days.findFirst({
      where: eq(days.id, id),
      with: {
        tasks: {
          orderBy: asc(tasks.id)
        }
      }
    });
  }

  async updateDay(id: number, updates: UpdateDayRequest): Promise<Day | undefined> {
    const [updated] = await db.update(days)
      .set(updates)
      .where(eq(days.id, id))
      .returning();
    return updated;
  }

  async createDays(newDays: InsertDay[]): Promise<Day[]> {
    return await db.insert(days).values(newDays).returning();
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task | undefined> {
    const [updated] = await db.update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getReminders(): Promise<ReminderTemplate[]> {
    return await db.select().from(reminderTemplates).orderBy(asc(reminderTemplates.dayNumber));
  }

  async seedReminders(): Promise<void> {
    const existing = await this.getReminders();
    if (existing.length > 0) return;

    const defaults = [
      { dayNumber: 1, message: "Set your intentions for this cycle. What is your main focus?" },
      { dayNumber: 2, message: "Break down your goal into small steps." },
      { dayNumber: 3, message: "Momentum is building. Keep going!" },
      { dayNumber: 4, message: "Review your progress. Are you on track?" },
      { dayNumber: 5, message: "Halfway point! Adjust your plan if needed." },
      { dayNumber: 6, message: "Stay consistent. Small efforts add up." },
      { dayNumber: 7, message: "Visualize the successful completion of this cycle." },
      { dayNumber: 8, message: "Finish strong. Clear any remaining blockers." },
      { dayNumber: 9, message: "Prepare for the next cycle. Reflect on this one." },
      { dayNumber: 10, message: "Cycle complete! Celebrate your wins and rest." },
    ];

    await db.insert(reminderTemplates).values(defaults);
  }

  async getAlarms(): Promise<Alarm[]> {
    return await db.select().from(alarms).orderBy(asc(alarms.time));
  }

  async createAlarm(alarm: InsertAlarm): Promise<Alarm> {
    const [newAlarm] = await db.insert(alarms).values(alarm).returning();
    return newAlarm;
  }

  async updateAlarm(id: number, updates: UpdateAlarmRequest): Promise<Alarm | undefined> {
    const [updated] = await db.update(alarms)
      .set(updates)
      .where(eq(alarms.id, id))
      .returning();
    return updated;
  }

  async deleteAlarm(id: number): Promise<void> {
    await db.delete(alarms).where(eq(alarms.id, id));
  }
}

export const storage = new DatabaseStorage();
