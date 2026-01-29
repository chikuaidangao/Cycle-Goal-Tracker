import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCycle, type InsertDay } from "@shared/routes";
import { z } from "zod";

export function useCycles() {
  return useQuery({
    queryKey: [api.cycles.list.path],
    queryFn: async () => {
      const res = await fetch(api.cycles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cycles");
      return api.cycles.list.responses[200].parse(await res.json());
    },
  });
}

export function useCycle(id: number) {
  return useQuery({
    queryKey: [api.cycles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cycles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cycle");
      return api.cycles.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useInitializeCycles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { startDate: Date | string }) => {
      const res = await fetch(api.cycles.initialize.path, {
        method: api.cycles.initialize.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to initialize cycles");
      return api.cycles.initialize.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cycles.list.path] }),
  });
}

export function useUpdateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCycle>) => {
      const url = buildUrl(api.cycles.update.path, { id });
      const res = await fetch(url, {
        method: api.cycles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cycle");
      return api.cycles.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.cycles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.cycles.get.path, variables.id] });
    },
  });
}

export function useUpdateDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertDay>) => {
      const url = buildUrl(api.days.update.path, { id });
      const res = await fetch(url, {
        method: api.days.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update day");
      return api.days.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // We need to invalidate the cycle this day belongs to
      // Since the API response is just the day, we'd ideally know the cycleId.
      // We can invalidate all cycle details for safety or optimistically update.
      // Here we invalidate cycle detail queries broadly since we don't have cycleId easily accessible in response
      // But actually, the day object has cycleId!
      queryClient.invalidateQueries({ queryKey: [api.cycles.get.path, data.cycleId] });
    },
  });
}

export function useReminders() {
  return useQuery({
    queryKey: [api.reminders.list.path],
    queryFn: async () => {
      const res = await fetch(api.reminders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reminders");
      return api.reminders.list.responses[200].parse(await res.json());
    },
  });
}
