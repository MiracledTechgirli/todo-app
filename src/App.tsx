import { useMemo, useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { FilterBar } from "./components/FilterBar";
import type { Filter } from "./types";

export default function App() {
  const api = useTodos();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "active") return api.todos.filter((t) => !t.done);
    if (filter === "done") return api.todos.filter((t) => t.done);
    return api.todos;
  }, [api.todos, filter]);

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
            Create, edit, complete, delete. Drag <span aria-hidden="true">⠿</span> to arrange.
            Sub-tasks compose inside each card.
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
          active={api.stats.active}
          done={api.stats.done}
          total={api.stats.total}
          onClearCompleted={api.clearCompleted}
        />
        <TodoList todos={visible} api={api} />
      </main>

      <footer className="mt-auto pt-4 text-center text-xs text-plum-400">
        <p>
          Stored locally in your browser · Keyboard-sortable · Responsive from 360px to desktop
        </p>
      </footer>
    </div>
  );
}
