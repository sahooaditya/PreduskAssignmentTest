"use client";

import { Provider } from "react-redux";
import { ActivityConsole } from "@/features/tasks/components/ActivityConsole";
import { store } from "@/store/store";

export default function Home() {
  return (
    <Provider store={store}>
      <ActivityConsole />
    </Provider>
  );
}
