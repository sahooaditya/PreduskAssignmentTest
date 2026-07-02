import type { Assignee, RawTask, Task, TaskStatus } from "./types";

const statusMap: Record<string, TaskStatus> = {
  todo: "todo",
  to_do: "todo",
  inprogress: "in_progress",
  in_progress: "in_progress",
  progress: "in_progress",
  qa: "qa",
  review: "qa",
  done: "done",
  complete: "done",
  completed: "done",
  blocked: "blocked"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function normalizeStatus(value: unknown): {
  status: TaskStatus;
  warning?: string;
} {
  const raw = readString(value);
  if (!raw) {
    return { status: "unknown", warning: "Missing status normalized to unknown." };
  }

  const key = raw.replace(/[\s-]/g, "_").toLowerCase();
  const compactKey = raw.replace(/[\s_-]/g, "").toLowerCase();
  const status = statusMap[key] ?? statusMap[compactKey];

  return status
    ? { status }
    : { status: "unknown", warning: `Unknown status "${raw}" normalized to unknown.` };
}

export function normalizeTimestamp(value: unknown): {
  timestamp: number;
  warning?: string;
} {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { timestamp: value };
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return { timestamp: parsed };
    }

    const date = Date.parse(value);
    if (Number.isFinite(date)) {
      return { timestamp: date };
    }
  }

  return {
    timestamp: Date.now(),
    warning: "Invalid updatedAt replaced with the current time."
  };
}

export function normalizeAssignee(value: unknown): Assignee | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const name = readString(value.name);

  return id && name ? { id, name } : null;
}

function normalizeAnnotationCount(value: unknown): {
  count: number;
  warning?: string;
} {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { count: Math.max(0, Math.trunc(value)) };
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return { count: Math.max(0, Math.trunc(parsed)) };
    }
  }

  return { count: 0, warning: "Invalid annotationCount normalized to 0." };
}

export function normalizeTask(raw: RawTask): Task {
  const warnings: string[] = [];
  const id = readString(raw.id) ?? `invalid-${crypto.randomUUID()}`;
  const title = readString(raw.title) ?? "Untitled task";

  if (!readString(raw.id)) {
    warnings.push("Missing id replaced with generated id.");
  }

  const statusResult = normalizeStatus(raw.status);
  if (statusResult.warning) warnings.push(statusResult.warning);

  const updatedAtResult = normalizeTimestamp(raw.updatedAt);
  if (updatedAtResult.warning) warnings.push(updatedAtResult.warning);

  const countResult = normalizeAnnotationCount(raw.annotationCount);
  if (countResult.warning) warnings.push(countResult.warning);

  const common = {
    id,
    title,
    status: statusResult.status,
    assignee: normalizeAssignee(raw.assignee),
    annotationCount: countResult.count,
    updatedAt: updatedAtResult.timestamp,
    meta: isRecord(raw.meta) ? raw.meta : {},
    warnings
  };

  switch (raw.type) {
    case "image":
      return { ...common, type: "image" };
    case "audio":
      return { ...common, type: "audio" };
    case "text":
      return { ...common, type: "text" };
    default: {
      const rawType = readString(raw.type) ?? "missing";
      warnings.push(`Unknown type "${rawType}" preserved as rawType.`);
      return { ...common, type: "unknown", rawType };
    }
  }
}

export function makePartialTask(id: string, patch?: Partial<Task>): Task {
  return {
    id,
    title: `Unloaded task ${id}`,
    type: "unknown",
    rawType: "unloaded",
    status: "unknown",
    assignee: null,
    annotationCount: 0,
    updatedAt: Date.now(),
    meta: {},
    warnings: ["Created from a live event before the full task was loaded."],
    isPartial: true,
    ...patch
  } satisfies Task;
}
