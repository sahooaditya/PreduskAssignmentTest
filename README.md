# Annotation Activity Console

Next.js App Router assessment implementation using React 18, strict TypeScript, Redux Toolkit, Tailwind, Jest, and React Testing Library.

## Run

```bash
npm install
# npm --prefix mock-server install
# npm run mock
npm run dev
```

Open `http://localhost:3000`. The mock API runs at `http://localhost:4000` and the WebSocket feed runs at `ws://localhost:4000/ws`.

## Test

```bash
npm test
```

## Structure

- `src/features/tasks/normalize.ts` converts messy backend payloads into a typed internal task model.
- `src/features/tasks/tasksSlice.ts` owns Redux Toolkit state, thunks, entity adapter storage, UI filters, and live event reducers.
- `src/features/tasks/selectors.ts` contains memoized derived views for components.
- `src/features/tasks/useTaskFeed.ts` manages WebSocket subscription and reconnects.
- `src/features/tasks/useTaskSummary.ts` streams task summaries and cancels stale requests when selection changes.
- `src/features/tasks/taskCache.ts` stores the most recent loaded task list in IndexedDB via localforage.
- `buggy/TaskTicker.tsx` contains the fixed bug-hunt component.

Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_WS_URL` if the mock server is not running on the defaults.
