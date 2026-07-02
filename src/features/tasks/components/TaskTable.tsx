import type { Task } from "../types";

type TaskTableProps = {
  tasks: Task[];
  loading: boolean;
  selectedTaskId: string | null;
  page: number;
  totalPages: number;
  onSelect: (taskId: string) => void;
  onPageChange: (page: number) => void;
};

export function TaskTable({
  tasks,
  loading,
  selectedTaskId,
  page,
  totalPages,
  onSelect,
  onPageChange
}: TaskTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded border border-neutral-300 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-300 px-3 py-2">
        <h2 className="text-base font-semibold">Tasks</h2>
        <span className="text-sm text-neutral-600">{loading ? "Loading..." : `${tasks.length} visible`}</span>
      </div>

      {tasks.length === 0 && !loading ? (
        <div className="px-4 py-8 text-center text-sm text-neutral-600">
          No tasks match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-100 text-xs uppercase text-neutral-600">
              <tr>
                <th className="px-3 py-2">Task</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assignee</th>
                <th className="px-3 py-2">Annotations</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`cursor-pointer border-t border-neutral-200 ${
                    selectedTaskId === task.id ? "bg-emerald-50" : "hover:bg-neutral-50"
                  }`}
                  onClick={() => onSelect(task.id)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-neutral-500">
                      {task.id}
                      {task.isPartial ? " - partial from live feed" : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">{task.type}</td>
                  <td className="px-3 py-2">{task.status}</td>
                  <td className="px-3 py-2">{task.assignee?.name ?? "Unassigned"}</td>
                  <td className="px-3 py-2">{task.annotationCount}</td>
                  <td className="px-3 py-2">{new Date(task.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-neutral-300 px-3 py-2 text-sm">
        <button
          className="rounded border border-neutral-300 px-3 py-1 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded border border-neutral-300 px-3 py-1 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
