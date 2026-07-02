import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFilters } from "../TaskFilters";
import { tasksReducer } from "../../tasksSlice";

function renderWithStore() {
  const store = configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });

  render(
    <Provider store={store}>
      <TaskFilters />
    </Provider>
  );

  return store;
}

describe("TaskFilters", () => {
  it("updates Redux filter state when the user searches", async () => {
    const user = userEvent.setup();
    const store = renderWithStore();

    await user.type(screen.getByLabelText(/search/i), "asha");

    expect(store.getState().tasks.filters.search).toBe("asha");
  });
});
