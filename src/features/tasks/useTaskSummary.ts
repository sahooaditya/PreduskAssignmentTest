import { useEffect, useState } from "react";
import { API_BASE } from "@/config";

type SummaryState = {
  markdown: string;
  status: "idle" | "loading" | "streaming" | "done" | "error";
  error: string | null;
};

const initialState: SummaryState = {
  markdown: "",
  status: "idle",
  error: null
};

export function useTaskSummary(taskId: string | null): SummaryState {
  const [state, setState] = useState<SummaryState>(initialState);

  useEffect(() => {
    if (!taskId) {
      setState(initialState);
      return;
    }

    const controller = new AbortController();
    let buffer = "";

    async function readSummary() {
      setState({ markdown: "", status: "loading", error: null });

      try {
        const response = await fetch(`${API_BASE}/api/tasks/${taskId}/summary`, {
          signal: controller.signal
        });

        if (!response.ok || !response.body) {
          throw new Error(`Summary request failed with ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        setState((current) => ({ ...current, status: "streaming" }));

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            if (frame.startsWith("event: done")) continue;

            const line = frame.split("\n").find((part) => part.startsWith("data: "));
            if (!line) continue;
            const rawData = line.slice(6);
            if (rawData === "end") continue;

            const chunk = JSON.parse(rawData) as string;
            setState((current) => ({
              ...current,
              status: "streaming",
              markdown: current.markdown + chunk
            }));
          }
        }

        setState((current) => ({ ...current, status: "done" }));
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          markdown: "",
          status: "error",
          error: error instanceof Error ? error.message : "Failed to stream summary."
        });
      }
    }

    void readSummary();

    return () => controller.abort();
  }, [taskId]);

  return state;
}
