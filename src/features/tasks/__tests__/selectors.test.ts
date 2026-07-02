import { configureStore } from "@reduxjs/toolkit";
import {
  fetchTasksPage,
  filtersChanged,
  tasksReducer,
  taskFeedEventReceived
} from "../tasksSlice";
import { selectVisibleTasks } from "../selectors";

function makeStore() {
  return configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });
}

describe("selectVisibleTasks", () => {
  it("does not create visible placeholder rows for unloaded live events", () => {
    const store = makeStore();

    store.dispatch(
      taskFeedEventReceived({
        kind: "task.updated",
        payload: { id: "t99", status: "done", updatedAt: 100 }
      })
    );

    expect(selectVisibleTasks(store.getState())).toHaveLength(0);
  });

  it("filters and sorts derived task views", () => {
    const store = makeStore();

    store.dispatch(
      fetchTasksPage.fulfilled(
        {
          tasks: [
            {
              id: "t1",
              title: "Loaded text task",
              type: "text",
              status: "todo",
              assignee: null,
              annotationCount: 1,
              updatedAt: 100,
              meta: {},
              warnings: []
            },
            {
              id: "t2",
              title: "Loaded image task",
              type: "image",
              status: "todo",
              assignee: null,
              annotationCount: 2,
              updatedAt: 200,
              meta: {},
              warnings: []
            }
          ],
          page: 1,
          pageSize: 25,
          total: 2
        },
        "request-id",
        { page: 1, pageSize: 25 }
      )
    );
    store.dispatch(
      taskFeedEventReceived({
        kind: "task.updated",
        payload: { id: "t1", status: "done", updatedAt: 300 }
      })
    );
    store.dispatch(filtersChanged({ status: "done" }));

    const visible = selectVisibleTasks(store.getState());

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe("t1");
  });
});
