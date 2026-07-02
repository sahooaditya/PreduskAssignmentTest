import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type PayloadAction
} from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { normalizeAssignee, normalizeStatus, normalizeTimestamp } from "./normalize";
import { fetchTasksPageApi } from "./tasksApi";
import { readTaskCache, writeTaskCache } from "./taskCache";
import type { Task, TaskFeedEvent, TaskFilters } from "./types";

const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => b.updatedAt - a.updatedAt
});

type TasksState = ReturnType<typeof tasksAdapter.getInitialState> & {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  cacheStatus: "empty" | "cached" | "fresh";
  cacheSavedAt: number | null;
  page: number;
  pageSize: number;
  total: number;
  selectedTaskId: string | null;
  filters: TaskFilters;
  feedStatus: "idle" | "connected" | "reconnecting" | "failed";
  feedError: string | null;
};

const initialState: TasksState = tasksAdapter.getInitialState({
  status: "idle",
  error: null,
  cacheStatus: "empty",
  cacheSavedAt: null,
  page: 1,
  pageSize: 25,
  total: 0,
  selectedTaskId: null,
  filters: {
    type: "all",
    status: "all",
    search: "",
    sortBy: "updatedAt",
    sortDirection: "desc"
  },
  feedStatus: "idle",
  feedError: null
});

export const loadCachedTasks = createAsyncThunk("tasks/loadCached", async () => {
  return readTaskCache();
});

export const fetchTasksPage = createAsyncThunk(
  "tasks/fetchPage",
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const result = await fetchTasksPageApi(page, pageSize);
    writeTaskCache({
      tasks: result.tasks,
      savedAt: Date.now(),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total
    });
    return result;
  }
);

function upsertLivePatch(state: TasksState, id: string, patch: Partial<Task>) {
  const existing = state.entities[id];
  if (existing) {
    tasksAdapter.updateOne(state, { id, changes: patch });
  }
}

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    selectedTaskChanged(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },
    filtersChanged(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    pageChanged(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    feedConnected(state) {
      state.feedStatus = "connected";
      state.feedError = null;
    },
    feedReconnecting(state) {
      state.feedStatus = "reconnecting";
    },
    feedFailed(state, action: PayloadAction<string>) {
      state.feedStatus = "failed";
      state.feedError = action.payload;
    },
    taskFeedEventReceived(state, action: PayloadAction<TaskFeedEvent>) {
      const event = action.payload;

      if (event.kind === "task.updated") {
        const status = normalizeStatus(event.payload.status).status;
        const updatedAt = normalizeTimestamp(event.payload.updatedAt).timestamp;
        upsertLivePatch(state, event.payload.id, { status, updatedAt });
      }

      if (event.kind === "task.assigned") {
        upsertLivePatch(state, event.payload.id, {
          assignee: normalizeAssignee(event.payload.assignee),
          updatedAt: Date.now()
        });
      }

      if (event.kind === "annotation.created") {
        const existing = state.entities[event.payload.taskId];
        upsertLivePatch(state, event.payload.taskId, {
          annotationCount: (existing?.annotationCount ?? 0) + 1,
          updatedAt: normalizeTimestamp(event.payload.at).timestamp
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCachedTasks.fulfilled, (state, action) => {
        if (!action.payload) return;
        tasksAdapter.setAll(state, action.payload.tasks);
        state.cacheStatus = "cached";
        state.cacheSavedAt = action.payload.savedAt;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(fetchTasksPage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasksPage.fulfilled, (state, action) => {
        tasksAdapter.upsertMany(state, action.payload.tasks);
        state.status = "succeeded";
        state.cacheStatus = "fresh";
        state.cacheSavedAt = Date.now();
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(fetchTasksPage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load tasks.";
      });
  }
});

export const {
  selectedTaskChanged,
  filtersChanged,
  pageChanged,
  feedConnected,
  feedReconnecting,
  feedFailed,
  taskFeedEventReceived
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;

export const tasksAdapterSelectors = tasksAdapter.getSelectors<RootState>(
  (state) => state.tasks
);
