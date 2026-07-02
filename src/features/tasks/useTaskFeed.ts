import { useEffect, useRef } from "react";
import { WS_URL } from "@/config";
import { useAppDispatch } from "@/store/hooks";
import {
  feedConnected,
  feedFailed,
  feedReconnecting,
  taskFeedEventReceived
} from "./tasksSlice";
import type { TaskFeedEvent } from "./types";

function parseFeedEvent(value: string): TaskFeedEvent | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "kind" in parsed &&
      "payload" in parsed
    ) {
      return parsed as TaskFeedEvent;
    }
  } catch {
    return null;
  }

  return null;
}

export function useTaskFeed() {
  const dispatch = useAppDispatch();
  const reconnectTimer = useRef<number | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let closedByEffect = false;
    let attempts = 0;

    const connect = () => {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        attempts = 0;
        dispatch(feedConnected());
      };

      socket.onmessage = (message) => {
        const event = parseFeedEvent(String(message.data));
        if (event) dispatch(taskFeedEventReceived(event));
      };

      socket.onerror = () => {
        dispatch(feedFailed("Live feed connection failed."));
      };

      socket.onclose = () => {
        if (closedByEffect) return;
        attempts += 1;
        dispatch(feedReconnecting());
        const delay = Math.min(1000 * 2 ** attempts, 10000);
        reconnectTimer.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      socket?.close();
    };
  }, [dispatch]);
}
