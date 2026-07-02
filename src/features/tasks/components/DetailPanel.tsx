import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { Task } from "../types";
import { useTaskSummary } from "../useTaskSummary";

type DetailPanelProps = {
  task: Task | null;
};

export function DetailPanel({ task }: DetailPanelProps) {
  const summary = useTaskSummary(task?.id ?? null);

  if (!task) {
    return (
      <aside className="rounded border border-neutral-300 bg-white p-4 text-sm text-neutral-600">
        Select a task to inspect details and stream its AI summary.
      </aside>
    );
  }

  return (
    <aside className="min-w-0 rounded border border-neutral-300 bg-white p-4">
      <div className="border-b border-neutral-300 pb-3">
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {task.id} - {task.type} - {task.status}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-medium text-neutral-600">Assignee</dt>
          <dd>{task.assignee?.name ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="font-medium text-neutral-600">Annotations</dt>
          <dd>{task.annotationCount}</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-medium text-neutral-600">Updated</dt>
          <dd>{new Date(task.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>

      {task.warnings.length > 0 ? (
        <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
          {task.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}

      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">AI summary</h3>
          <span className="text-xs text-neutral-500">{summary.status}</span>
        </div>
        {summary.error ? (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {summary.error}
          </div>
        ) : (
          <div className="markdown min-h-40 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm">
            {summary.markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {summary.markdown}
              </ReactMarkdown>
            ) : (
              <span className="text-neutral-500">Waiting for streamed content...</span>
            )}
          </div>
        )}
      </section>
    </aside>
  );
}
