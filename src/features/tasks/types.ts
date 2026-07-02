export type TaskKind = "image" | "audio" | "text" | "unknown";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "qa"
  | "done"
  | "blocked"
  | "unknown";

export type Assignee = {
  id: string;
  name: string;
};

export type TaskBase = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: Assignee | null;
  annotationCount: number;
  updatedAt: number;
  meta: Record<string, unknown>;
  warnings: string[];
  isPartial?: boolean;
};

export type ImageTask = TaskBase & { type: "image" };
export type AudioTask = TaskBase & { type: "audio" };
export type TextTask = TaskBase & { type: "text" };
export type UnknownTask = TaskBase & {
  type: "unknown";
  rawType: string;
};

export type Task = ImageTask | AudioTask | TextTask | UnknownTask;

export type RawTask = Record<string, unknown>;

export type TasksResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: RawTask[];
};

export type TaskSortKey = "updatedAt" | "annotationCount";

export type TaskFilters = {
  type: TaskKind | "all";
  status: TaskStatus | "all";
  search: string;
  sortBy: TaskSortKey;
  sortDirection: "asc" | "desc";
};

export type TaskFeedEvent =
  | {
      kind: "task.updated";
      payload: {
        id: string;
        status?: unknown;
        updatedAt?: unknown;
      };
    }
  | {
      kind: "task.assigned";
      payload: {
        id: string;
        assignee?: unknown;
      };
    }
  | {
      kind: "annotation.created";
      payload: {
        taskId: string;
        by?: unknown;
        at?: unknown;
      };
    };
