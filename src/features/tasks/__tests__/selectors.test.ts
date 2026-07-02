import { configureStore } from "@reduxjs/toolkit";
import { filtersChanged, tasksReducer, taskFeedEventReceived } from "../tasksSlice";
import { selectVisibleTasks } from "../selectors";

function makeStore() {
  return configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });
}

describe("selectVisibleTasks", () => {
  it("filters and sorts derived task views", () => {
    const store = makeStore();

    store.dispatch(
      taskFeedEventReceived({
        kind: "task.updated",
        payload: { id: "t1", status: "done", updatedAt: 100 }
      })
    );
    store.dispatch(
      taskFeedEventReceived({
        kind: "task.updated",
        payload: { id: "t2", status: "todo", updatedAt: 200 }
      })
    );
    store.dispatch(filtersChanged({ status: "done" }));

    const visible = selectVisibleTasks(store.getState());

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe("t1");
  });
});
