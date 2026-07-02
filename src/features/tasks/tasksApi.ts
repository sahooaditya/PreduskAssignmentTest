import { API_BASE } from "@/config";
import { normalizeTask } from "./normalize";
import type { Task, TasksResponse } from "./types";

export async function fetchTasksPageApi(
  page: number,
  pageSize: number
): Promise<{ tasks: Task[]; page: number; pageSize: number; total: number }> {
  const response = await fetch(
    `${API_BASE}/api/tasks?page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error(`Task request failed with ${response.status}`);
  }

  const payload = (await response.json()) as TasksResponse;
  return {
    tasks: payload.items.map(normalizeTask),
    page: payload.page,
    pageSize: payload.pageSize,
    total: payload.total
  };
}
