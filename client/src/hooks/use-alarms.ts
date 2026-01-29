import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertAlarm } from "@shared/schema";

export function useAlarms() {
  return useQuery({
    queryKey: [api.alarms.list.path],
    queryFn: async () => {
      const res = await fetch(api.alarms.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alarms");
      return api.alarms.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAlarm) => {
      const res = await fetch(api.alarms.create.path, {
        method: api.alarms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create alarm");
      return api.alarms.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.alarms.list.path] }),
  });
}

export function useUpdateAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAlarm>) => {
      const url = buildUrl(api.alarms.update.path, { id });
      const res = await fetch(url, {
        method: api.alarms.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update alarm");
      return api.alarms.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.alarms.list.path] }),
  });
}

export function useDeleteAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.alarms.delete.path, { id });
      const res = await fetch(url, {
        method: api.alarms.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete alarm");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.alarms.list.path] }),
  });
}
