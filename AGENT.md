# AGENT.md — Pink Todos

React + Vite + TypeScript + Tailwind CSS v4 todo app. Minimal light-pink theme,
full CRUD, composable responsive sub-tasks, drag-and-drop reorder (dnd-kit).

## Commands

- `npm run dev` — dev server (http://localhost:5199)
- `npm run build` — typecheck + production build
- `npm run preview` — serve `dist/` locally

## Architecture (composable)

- `src/types.ts` — `Todo`, `SubTask`, `Filter` types + `uid()`
- `src/hooks/useTodos.ts` — all state + localStorage persistence (`pink-todos-v1`).
  CRUD: `addTodo / updateTodo / toggleTodo / deleteTodo / clearCompleted / reorder`
  + subtask CRUD: `addSubtask / toggleSubtask / updateSubtask / deleteSubtask`
- `src/components/TodoForm.tsx` — create form (`data-testid: new-todo-title, new-todo-desc, add-todo`)
- `src/components/TodoList.tsx` — dnd-kit sortable list (`data-testid: todo-list, empty-state`)
- `src/components/TodoItem.tsx` — card with body slot for description + `SubTaskList`
  (`data-testid: todo-<id>, toggle-<id>, edit-<id>, save-<id>, delete-<id>, drag-<id>, title-<id>, desc-<id>`)
- `src/components/SubTaskList.tsx` — **composable + responsive** sub-todo list, usable in any card body
  (`data-testid: new-subtask-<todoId>, add-subtask-<todoId>, subtask-toggle-<subId>, subtask-delete-<subId>`)
- `src/components/FilterBar.tsx` — All/Active/Done filter + counts (`filter-all|active|done, counts, clear-completed`)
- `src/App.tsx` — composition root, progress ring (`data-testid: progress`), skip link

## Theme — pink light (minimal)

Tailwind v4 tokens in `src/index.css` via `@theme`:
`blush-50 #FFF9FB, blush-100 #FDF1F5, blush-200 #FBE4EC, blush-300 #F6CBD9, blush-400 #EFA9C2, petal-400 #E58AA8, petal-500 #D56A90, petal-600 #B74E75, petal-700 #8E3A5B, plum-900 #4E2433, plum-700 #71404F, plum-500 #9A6E7C`.
Page bg = `blush-100` with dot texture, cards = `blush-50` with blush border.
Focus visible = petal-600 outline. Reduced-motion respected.

## Testing — use Playwright CLI

> Agents MUST use the **Playwright CLI** (`npx playwright ...`) to verify this app.
> Do not rely on `vite build` alone — exercise the real UI in Chromium.

Setup (one time):

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Config: `playwright.config.ts` (dev server on :5199, `tests/*.spec.ts`).

Run:

```bash
npx playwright test                 # full suite (CRUD, dnd, responsive, a11y, colours)
npx playwright test --headed        # watch it
npx playwright test -g "crud"       # subset
npx playwright show-report          # HTML report
```

Ad-hoc CLI probes (no test file needed):

```bash
# serve + snapshot the page
npm run dev -- --port 5199 &
npx playwright open http://localhost:5199
npx playwright screenshot --viewport-size=390,844 --full-page -o mobile.png http://localhost:5199
npx playwright screenshot --viewport-size=1280,800 --full-page -o desktop.png http://localhost:5199
npx playwright codegen http://localhost:5199   # record selectors
```

What the suite covers (`tests/todo.spec.ts`):
1. **CRUD** — create (title+desc), toggle done, edit title+desc, delete, persistence across reload
2. **Sub-tasks** — add / toggle / delete + progress counter
3. **Drag-and-drop** — pointer reorder (mouse down on handle, move to next card) changes order
4. **Filtering** — All / Active / Done + clear-completed
5. **Responsiveness** — 390px mobile: no horizontal overflow, form stacks; 1280px desktop layout
6. **Colours** — computed body bg ≈ blush-100 `#fdf1f5`, card bg ≈ blush-50 `#fff9fb`
7. **a11y** — labels on all inputs, checkbox names, `todo-list` list, progressbar role, skip link, heading order, focus-visible, no `aria-hidden` focusables
