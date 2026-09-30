import { useState } from "react";

interface Props {
  onAdd: (title: string, description: string) => void;
}

/** Composable create form. Minimal, labelled for a11y. */
export function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expanded, setExpanded] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, description);
    setTitle("");
    setDescription("");
    setExpanded(false);
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Add a todo"
      className="blush-card rounded-2xl p-3 sm:p-4"
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
          Add
        </button>
      </div>
      {(expanded || description) && (
        <div className="mt-2">
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
      )}
    </form>
  );
}
