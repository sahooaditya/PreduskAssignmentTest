import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { filtersChanged } from "../tasksSlice";
import type { TaskKind, TaskSortKey, TaskStatus } from "../types";

const types: Array<TaskKind | "all"> = ["all", "image", "audio", "text", "unknown"];
const statuses: Array<TaskStatus | "all"> = [
  "all",
  "todo",
  "in_progress",
  "qa",
  "done",
  "blocked",
  "unknown"
];

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.tasks.filters);

  return (
    <section className="grid gap-3 border-b border-neutral-300 pb-4 md:grid-cols-[1fr_180px_180px_180px_140px]">
      <label className="text-sm font-medium text-neutral-700">
        Search
        <input
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
          value={filters.search}
          onChange={(event) => dispatch(filtersChanged({ search: event.target.value }))}
          placeholder="Title, id, assignee"
        />
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Type
        <select
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
          value={filters.type}
          onChange={(event) =>
            dispatch(filtersChanged({ type: event.target.value as TaskKind | "all" }))
          }
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Status
        <select
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
          value={filters.status}
          onChange={(event) =>
            dispatch(filtersChanged({ status: event.target.value as TaskStatus | "all" }))
          }
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Sort
        <select
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
          value={filters.sortBy}
          onChange={(event) =>
            dispatch(filtersChanged({ sortBy: event.target.value as TaskSortKey }))
          }
        >
          <option value="updatedAt">updatedAt</option>
          <option value="annotationCount">annotations</option>
        </select>
      </label>

      <label className="text-sm font-medium text-neutral-700">
        Direction
        <select
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
          value={filters.sortDirection}
          onChange={(event) =>
            dispatch(
              filtersChanged({
                sortDirection: event.target.value === "asc" ? "asc" : "desc"
              })
            )
          }
        >
          <option value="desc">desc</option>
          <option value="asc">asc</option>
        </select>
      </label>
    </section>
  );
}
