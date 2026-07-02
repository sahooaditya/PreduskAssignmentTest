"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTasksPage,
  loadCachedTasks,
  pageChanged,
  selectedTaskChanged
} from "../tasksSlice";
import { selectSelectedTask, selectTasksPerStatus, selectVisibleTasks } from "../selectors";
import { useTaskFeed } from "../useTaskFeed";
import { DetailPanel } from "./DetailPanel";
import { TaskFilters } from "./TaskFilters";
import { TaskTable } from "./TaskTable";

export function ActivityConsole() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectVisibleTasks);
  const selectedTask = useAppSelector(selectSelectedTask);
  const metrics = useAppSelector(selectTasksPerStatus);
  const { page, pageSize, total, status, error, cacheStatus, cacheSavedAt, feedStatus } =
    useAppSelector((state) => state.tasks);

  useTaskFeed();

  useEffect(() => {
    void dispatch(loadCachedTasks());
    void dispatch(fetchTasksPage({ page: 1, pageSize }));
  }, [dispatch, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function goToPage(nextPage: number) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    dispatch(pageChanged(safePage));
    void dispatch(fetchTasksPage({ page: safePage, pageSize }));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5">
      <header className="flex flex-col gap-3 border-b border-neutral-300 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Annotation Activity Console</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {cacheStatus === "cached"
              ? `Showing cached data from ${cacheSavedAt ? new Date(cacheSavedAt).toLocaleTimeString() : "a previous session"} while refreshing.`
              : cacheStatus === "fresh"
                ? "Fresh data loaded from the mock API."
                : "Loading task data from the mock API."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(metrics).map(([name, count]) => (
            <span key={name} className="rounded border border-neutral-300 bg-white px-2 py-1">
              {name}: {count}
            </span>
          ))}
          <span className="rounded border border-neutral-300 bg-white px-2 py-1">
            feed: {feedStatus}
          </span>
        </div>
      </header>

      <TaskFilters />

      {error ? (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <TaskTable
          loading={status === "loading"}
          page={page}
          totalPages={totalPages}
          tasks={tasks}
          selectedTaskId={selectedTask?.id ?? null}
          onSelect={(taskId) => dispatch(selectedTaskChanged(taskId))}
          onPageChange={goToPage}
        />
        <DetailPanel task={selectedTask} />
      </section>
    </main>
  );
}
