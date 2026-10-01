import { useState } from "react";
import type { Priority, Category } from "../types";
import type { AddTodoOptions } from "../hooks/useTodos";

interface Props {
  onAdd: (title: string, description: string, options?: AddTodoOptions) => void;
}

const CATEGORIES: Category[] = ["Personal", "Work", "Shopping", "Ideas", "Health", "General"];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

/** Composable create form with priority, due date, and category options. Minimal, labelled for a11y. */
export function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("Personal");
  const [dueDate, setDueDate] = useState("");
  const [expanded, setExpanded] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, description, { priority, category, dueDate });
    setTitle("");
    setDescription("");
    setDueDate("");
    setExpanded(false);
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Add a todo"
      className="blush-card rounded-2xl p-3 sm:p-4 transition-all"
    >
      <label htmlFor="new-todo-title" className="sr-only">
        Todo title
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="new-todo-title"
          data-testid="new-todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What needs doing?"
          maxLength={120}
          autoComplete="off"
          className="min-h-11 flex-1 rounded-xl border border-blush-300 bg-white/70 px-3 text-[15px] text-plum-900 placeholder:text-plum-400 focus:border-petal-600 focus:outline-none"
        />
        <button
          type="submit"
          data-testid="add-todo"
          disabled={!title.trim()}
          className="min-h-11 rounded-xl bg-plum-900 px-4 text-sm font-medium text-blush-50 transition hover:bg-petal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Todo
        </button>
      </div>

      {(expanded || description || dueDate || category !== "Personal" || priority !== "medium") && (
        <div className="mt-3 flex flex-col gap-3 pt-2 border-t border-blush-200">
          <div>
            <label htmlFor="new-todo-desc" className="sr-only">
              Todo description
            </label>
            <textarea
              id="new-todo-desc"
              data-testid="new-todo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              maxLength={500}
              className="w-full resize-y rounded-xl border border-blush-300 bg-white/70 px-3 py-2 text-sm text-plum-900 placeholder:text-plum-400 focus:border-petal-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Category selection */}
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-plum-700">Category:</span>
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    data-testid={`category-select-${cat.toLowerCase()}`}
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg px-2 py-1 transition ${
                      category === cat
                        ? "bg-petal-600 text-white font-medium"
                        : "bg-blush-100 text-plum-700 hover:bg-blush-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority selection */}
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-plum-700">Priority:</span>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    data-testid={`priority-select-${p.value}`}
                    onClick={() => setPriority(p.value)}
                    className={`rounded-lg px-2 py-1 capitalize transition ${
                      priority === p.value
                        ? p.value === "high"
                          ? "bg-rose-600 text-white font-medium"
                          : p.value === "medium"
                          ? "bg-amber-600 text-white font-medium"
                          : "bg-emerald-600 text-white font-medium"
                        : "bg-blush-100 text-plum-700 hover:bg-blush-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date selection */}
            <div className="flex flex-col gap-1">
              <label htmlFor="new-todo-due" className="font-semibold text-plum-700">
                Due Date:
              </label>
              <input
                type="date"
                id="new-todo-due"
                data-testid="new-todo-due"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border border-blush-300 bg-white/70 px-2 py-1 text-plum-900 focus:border-petal-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

