import localforage from "localforage";
import type { Task } from "./types";

export type CachedTasks = {
  tasks: Task[];
  savedAt: number;
  page: number;
  pageSize: number;
  total: number;
};

const taskCache = localforage.createInstance({
  name: "annotation-console",
  storeName: "tasks"
});

const TASK_LIST_KEY = "latest-task-list";

export async function readTaskCache(): Promise<CachedTasks | null> {
  return taskCache.getItem<CachedTasks>(TASK_LIST_KEY);
}

export function writeTaskCache(cache: CachedTasks): void {
  if (typeof window === "undefined") return;

  window.setTimeout(() => {
    void taskCache.setItem(TASK_LIST_KEY, cache);
  }, 0);
}
