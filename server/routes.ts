
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { addDays } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed reminders on startup
  await storage.seedReminders();

  app.get(api.cycles.list.path, async (req, res) => {
    const cycles = await storage.getCycles();
    res.json(cycles);
  });

  app.get(api.cycles.get.path, async (req, res) => {
    const cycle = await storage.getCycle(Number(req.params.id));
    if (!cycle) {
      return res.status(404).json({ message: "Cycle not found" });
    }
    res.json(cycle);
  });

  app.put(api.cycles.update.path, async (req, res) => {
    try {
      const input = api.cycles.update.input.parse(req.body);
      const updated = await storage.updateCycle(Number(req.params.id), input);
      if (!updated) {
        return res.status(404).json({ message: "Cycle not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.cycles.initialize.path, async (req, res) => {
    try {
      const { startDate } = api.cycles.initialize.input.parse(req.body);
      
      // Clear existing data logic if needed, or just fail if exists. 
      // For this app, let's assume "initialize" resets everything.
      await storage.clearCycles();

      const start = new Date(startDate);
      const cyclesToInsert = [];
      const daysToInsert = [];
      
      let currentCycleStart = start;

      // Generate 36 cycles
      for (let i = 1; i <= 36; i++) {
        const cycleEndDate = addDays(currentCycleStart, 9); // 10 days inclusive
        
        cyclesToInsert.push({
          cycleNumber: i,
          startDate: currentCycleStart,
          endDate: cycleEndDate,
          status: i === 1 ? "active" : "upcoming",
          goal: "",
        });

        // We can't insert days yet because we need cycle IDs.
        // So we must insert cycles first, get IDs, then insert days.
        currentCycleStart = addDays(cycleEndDate, 1);
      }

      const createdCycles = await storage.createCycles(cyclesToInsert);

      // Now create days for each cycle
      for (const cycle of createdCycles) {
        let cycleDayDate = new Date(cycle.startDate);
        for (let j = 1; j <= 10; j++) {
          daysToInsert.push({
            cycleId: cycle.id,
            dayNumber: j,
            date: cycleDayDate,
            goal: "",
            isCompleted: false,
            notes: "",
          });
          cycleDayDate = addDays(cycleDayDate, 1);
        }
      }

      await storage.createDays(daysToInsert);

      res.status(201).json({ message: "Initialized 36 cycles", count: createdCycles.length });
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
         return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to initialize cycles" });
    }
  });

  app.get(api.days.get.path, async (req, res) => {
    const day = await storage.getDay(Number(req.params.id));
    if (!day) {
      return res.status(404).json({ message: "Day not found" });
    }
    res.json(day);
  });

  app.put(api.days.update.path, async (req, res) => {
    try {
      const input = api.days.update.input.parse(req.body);
      const updated = await storage.updateDay(Number(req.params.id), input);
      if (!updated) {
        return res.status(404).json({ message: "Day not found" });
      }
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const updated = await storage.updateTask(Number(req.params.id), input);
       if (!updated) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.reminders.list.path, async (req, res) => {
    const reminders = await storage.getReminders();
    res.json(reminders);
  });

  // Alarm endpoints
  app.get(api.alarms.list.path, async (req, res) => {
    const alarmList = await storage.getAlarms();
    res.json(alarmList);
  });

  app.post(api.alarms.create.path, async (req, res) => {
    try {
      const input = api.alarms.create.input.parse(req.body);
      const alarm = await storage.createAlarm(input);
      res.status(201).json(alarm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.alarms.update.path, async (req, res) => {
    try {
      const input = api.alarms.update.input.parse(req.body);
      const updated = await storage.updateAlarm(Number(req.params.id), input);
      if (!updated) {
        return res.status(404).json({ message: "Alarm not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.alarms.delete.path, async (req, res) => {
    await storage.deleteAlarm(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
