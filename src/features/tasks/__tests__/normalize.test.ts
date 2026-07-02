import { normalizeTask } from "../normalize";

describe("normalizeTask", () => {
  it("normalizes messy API fields into the internal task model", () => {
    const task = normalizeTask({
      id: "t11",
      title: "Task 11",
      type: "video",
      status: "InProgress",
      assignee: null,
      annotationCount: "12",
      updatedAt: "2024-06-28T20:00:00.000Z",
      meta: { priority: "high" }
    });

    expect(task).toMatchObject({
      id: "t11",
      title: "Task 11",
      type: "unknown",
      rawType: "video",
      status: "in_progress",
      assignee: null,
      annotationCount: 12,
      updatedAt: Date.parse("2024-06-28T20:00:00.000Z")
    });
    expect(task.warnings).toContain('Unknown type "video" preserved as rawType.');
  });
});
