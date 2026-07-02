# Decisions

## State and fetching

I used Redux Toolkit slices, `createAsyncThunk`, and `createEntityAdapter` instead of RTK Query. RTK Query would be a good fit for REST cache invalidation, but this exercise has custom WebSocket merge behavior, IndexedDB hydration, and local UI filters, so a hand-owned slice keeps the data flow easier to explain and change live.

The task list is normalized by id in Redux. Components read memoized selectors such as `selectVisibleTasks` rather than raw state, so filter, sort, search, and metrics logic stays out of the view layer.

## Messy API data

`normalize.ts` treats raw payloads as `Record<string, unknown>` and narrows field by field. Known task types become a discriminated union; unknown types become `{ type: "unknown", rawType }` so the UI can still show them instead of dropping data.

Statuses are mapped into a normalized enum, timestamps accept epoch numbers or ISO strings, string counts are parsed, and invalid fields add warnings. Garbage values are replaced with safe defaults only when needed, and the task keeps warnings for debugging.

## Live events

`useTaskFeed` owns the WebSocket lifecycle and dispatches parsed events into Redux. Reconnects use capped exponential backoff, and events for unloaded tasks create partial placeholder records so updates are visible without pretending the full task is known.

## Streaming markdown safety

`useTaskSummary` reads the SSE stream incrementally with `ReadableStream`, appending each markdown chunk as it arrives. Switching tasks aborts the old request with `AbortController`.

Untrusted content is rendered in `DetailPanel.tsx` through `react-markdown` with `rehype-sanitize`. I do not enable raw HTML parsing, and the sanitize plugin is still present in the rendering path, so injected `<img onerror>` and `<script>` payloads are not executed.

## IndexedDB cache

The latest loaded page is stored in IndexedDB via localforage after a successful fetch. On reload, cached tasks hydrate immediately and the UI labels them as cached until the fresh request succeeds.

Writes are scheduled asynchronously, and Redux reducers stay pure. I only cache the task list, not live feed deltas or summaries, to avoid overstating freshness.

## Bug hunt

`TaskTicker` had a stale interval closure because `setTick(tick + 1)` captured the initial value. The fix uses a functional update so each tick is based on the latest state.

It fetched `/api/tasks/null` on first render and ignored `apiBase` in the dependency list. The fix skips null selections, includes dependencies, and aborts stale requests.

It mutated React state with `prev.push(t)` and returned the same array reference. The fix returns a new array and deduplicates by task id.

It sorted the state array in place and used array index keys. The fix sorts a copied array and uses stable `task.id` keys.

It had no response error handling, so failed requests could be inserted or fail silently. The fix checks `response.ok` and ignores only intentional aborts.

## Next steps

With more time I would add virtualized rows, cache streamed summaries by task id, and add a small assign-to-me action with rollback. I used AI assistance for scaffolding and checked the implementation with TypeScript/Jest commands.
