import { useMemo, useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { FilterBar } from "./components/FilterBar";
import type { Filter, SortOption } from "./types";

export default function App() {
  const api = useTodos();
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("manual");

  const visible = useMemo(() => {
    let result = [...api.todos];

    // 1. Status Filter
    if (filter === "active") result = result.filter((t) => !t.done);
    if (filter === "done") result = result.filter((t) => t.done);

    // 2. Category Filter
    if (categoryFilter !== "All Categories") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.subtasks.some((s) => s.title.toLowerCase().includes(q))
      );
    }

    // 4. Sorting & Pinning (Pinned items always come first unless custom sorting is active)
    result.sort((a, b) => {
      // Pinned items prioritized
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === "priority") {
        const pMap = { high: 1, medium: 2, low: 3 };
        const pA = pMap[a.priority ?? "medium"];
        const pB = pMap[b.priority ?? "medium"];
        return pA - pB;
      }
      if (sortBy === "createdAt") {
        return b.createdAt - a.createdAt;
      }
      return 0; // Manual dnd order
    });

    return result;
  }, [api.todos, filter, categoryFilter, searchQuery, sortBy]);

  const progress = api.stats.total === 0 ? 0 : Math.round((api.stats.done / api.stats.total) * 100);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-10">
      <a href="#main" className="sr-only focus:not-sr-only focus:rounded focus:bg-white focus:p-2">
        Skip to todo list
      </a>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-petal-700 uppercase">
            Pink / Light
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-plum-900 sm:text-3xl">
            Todos, kept minimal.
          </h1>
          <p className="mt-1 max-w-md text-sm text-plum-500">
            Create, tag, prioritize, edit, complete. Drag <span aria-hidden="true">⠿</span> to arrange.
            Pin items, assign due dates & categories.
          </p>
        </div>
        <div
          aria-label={`${progress}% complete`}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid="progress"
          className="blush-card mt-1 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl"
        >
          <span className="text-sm font-semibold text-plum-900">{progress}%</span>
          <span className="text-[10px] text-plum-500">done</span>
        </div>
      </header>

      <main id="main" className="flex flex-col gap-3 sm:gap-4">
        <TodoForm onAdd={api.addTodo} />
        <FilterBar
          filter={filter}
          onChange={setFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          active={api.stats.active}
          done={api.stats.done}
          total={api.stats.total}
          onClearCompleted={api.clearCompleted}
          onExport={api.exportTodos}
          onImport={api.importTodos}
        />
        <TodoList todos={visible} api={api} />
      </main>

      <footer className="mt-auto pt-4 text-center text-xs text-plum-400">
        <p>
          Stored locally in your browser · Priority & Due Dates · Drag-and-drop sortable · Responsive
        </p>
      </footer>
    </div>
  );
}

