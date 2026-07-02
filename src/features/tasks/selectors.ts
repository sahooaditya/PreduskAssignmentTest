import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { tasksAdapterSelectors } from "./tasksSlice";
import type { Task } from "./types";

export const selectAllTasks = tasksAdapterSelectors.selectAll;

export const selectTaskById = (state: RootState, id: string | null) =>
  id ? tasksAdapterSelectors.selectById(state, id) ?? null : null;

export const selectSelectedTask = (state: RootState) =>
  selectTaskById(state, state.tasks.selectedTaskId);

export const selectTaskFilters = (state: RootState) => state.tasks.filters;

export const selectVisibleTasks = createSelector(
  [selectAllTasks, selectTaskFilters],
  (tasks, filters) => {
    const search = filters.search.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (task.isPartial) return false;

      const typeMatches = filters.type === "all" || task.type === filters.type;
      const statusMatches =
        filters.status === "all" || task.status === filters.status;
      const searchMatches =
        search.length === 0 ||
        task.title.toLowerCase().includes(search) ||
        task.id.toLowerCase().includes(search) ||
        task.assignee?.name.toLowerCase().includes(search);

      return typeMatches && statusMatches && Boolean(searchMatches);
    });

    return [...filtered].sort((a, b) => compareTasks(a, b, filters));
  }
);

function compareTasks(
  a: Task,
  b: Task,
  filters: ReturnType<typeof selectTaskFilters>
) {
  const direction = filters.sortDirection === "asc" ? 1 : -1;
  return (a[filters.sortBy] - b[filters.sortBy]) * direction;
}

export const selectTasksPerStatus = createSelector([selectAllTasks], (tasks) =>
  tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
    return counts;
  }, {})
);
