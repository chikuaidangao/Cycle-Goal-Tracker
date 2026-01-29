import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTask } from "@shared/routes";

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: InsertTask) => {
      const res = await fetch(api.tasks.create.path, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create task");
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: (newTask) => {
       // Ideally we invalidate the specific cycle or day query
       // We can invalidate keys that might contain this task
       queryClient.invalidateQueries({ queryKey: [api.days.get.path, newTask.dayId] });
       // Also invalidate any cycle queries that include this day's tasks
       queryClient.invalidateQueries({ queryKey: [api.cycles.get.path] }); 
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTask>) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedTask) => {
       queryClient.invalidateQueries({ queryKey: [api.cycles.get.path] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { 
        method: api.tasks.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: [api.cycles.get.path] });
    },
  });
}
