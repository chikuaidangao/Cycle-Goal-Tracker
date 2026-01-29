
import { z } from 'zod';
import { insertCycleSchema, insertDaySchema, insertTaskSchema, insertAlarmSchema, cycles, days, tasks, reminderTemplates, alarms } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  cycles: {
    list: {
      method: 'GET' as const,
      path: '/api/cycles',
      responses: {
        200: z.array(z.custom<typeof cycles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cycles/:id',
      responses: {
        200: z.custom<typeof cycles.$inferSelect & { days: (typeof days.$inferSelect & { tasks: typeof tasks.$inferSelect[] })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cycles/:id',
      input: insertCycleSchema.partial(),
      responses: {
        200: z.custom<typeof cycles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    initialize: { // Initialize/Reset the 36 cycles starting from a given date
      method: 'POST' as const,
      path: '/api/cycles/initialize',
      input: z.object({
        startDate: z.string().or(z.date()), // Accepts ISO string or Date object
      }),
      responses: {
        201: z.object({ message: z.string(), count: z.number() }),
      },
    }
  },
  days: {
    get: {
      method: 'GET' as const,
      path: '/api/days/:id',
      responses: {
        200: z.custom<typeof days.$inferSelect & { tasks: typeof tasks.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/days/:id',
      input: insertDaySchema.partial(),
      responses: {
        200: z.custom<typeof days.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  tasks: {
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  reminders: {
    list: {
      method: 'GET' as const,
      path: '/api/reminders',
      responses: {
        200: z.array(z.custom<typeof reminderTemplates.$inferSelect>()),
      },
    }
  },
  alarms: {
    list: {
      method: 'GET' as const,
      path: '/api/alarms',
      responses: {
        200: z.array(z.custom<typeof alarms.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/alarms',
      input: insertAlarmSchema,
      responses: {
        201: z.custom<typeof alarms.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/alarms/:id',
      input: insertAlarmSchema.partial(),
      responses: {
        200: z.custom<typeof alarms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/alarms/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
