import { useState } from "react";
import type { SubTask } from "../types";

interface Props {
  todoId: string;
  subtasks: SubTask[];
  onAdd: (todoId: string, title: string) => void;
  onToggle: (todoId: string, subId: string) => void;
  onUpdate: (todoId: string, subId: string, title: string) => void;
  onDelete: (todoId: string, subId: string) => void;
}

/**
 * Composable + responsive sub-todo list.
 * Compose it anywhere a Todo's children slot is rendered.
 * Stacks vertically on mobile, roomy hit-targets, fully labelled.
 */
export function SubTaskList({ todoId, subtasks, onAdd, onToggle, onUpdate, onDelete }: Props) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(todoId, draft);
    setDraft("");
  };

  const doneCount = subtasks.filter((s) => s.done).length;

  return (
    <section aria-label="Sub-tasks" className="mt-2 rounded-xl bg-blush-100/80 p-2 sm:p-3">
      {subtasks.length > 0 && (
        <p data-testid={`subtask-progress-${todoId}`} className="px-1 pb-1 text-xs text-plum-500">
          {doneCount}/{subtasks.length} sub-tasks done
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {subtasks.map((s) => (
          <li
            key={s.id}
            className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-blush-200/70"
          >
            <input
              type="checkbox"
              id={`sub-${s.id}`}
              checked={s.done}
              onChange={() => onToggle(todoId, s.id)}
              aria-label={`Mark sub-task ${s.title} as ${s.done ? "not done" : "done"}`}
              data-testid={`subtask-toggle-${s.id}`}
              className="h-4 w-4 shrink-0 accent-petal-700"
            />
            {editingId === s.id ? (
              <form
                className="flex flex-1 gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editValue.trim()) onUpdate(todoId, s.id, editValue.trim());
                  setEditingId(null);
                }}
              >
                <label htmlFor={`edit-sub-${s.id}`} className="sr-only">
                  Edit sub-task
                </label>
                <input
                  id={`edit-sub-${s.id}`}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  maxLength={120}
                  className="min-h-8 flex-1 rounded-md border border-petal-500 bg-white px-2 text-sm"
                />
                <button type="submit" aria-label="Save sub-task" className="rounded-md bg-plum-900 px-2 text-xs text-blush-50">
                  Save
                </button>
              </form>
            ) : (
              <>
                <label
                  htmlFor={`sub-${s.id}`}
                  className={`flex-1 cursor-pointer text-sm break-words ${s.done ? "text-plum-400 line-through" : "text-plum-700"}`}
                >
                  {s.title}
                </label>
                <button
                  type="button"
                  aria-label={`Edit sub-task ${s.title}`}
                  onClick={() => {
                    setEditingId(s.id);
                    setEditValue(s.title);
                  }}
                  className="rounded p-1 text-xs text-plum-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:text-plum-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-label={`Delete sub-task ${s.title}`}
                  data-testid={`subtask-delete-${s.id}`}
                  onClick={() => onDelete(todoId, s.id)}
                  className="rounded p-1 text-xs text-plum-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:text-red-800"
                >
                  ✕
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-1 flex gap-1">
        <label htmlFor={`new-sub-${todoId}`} className="sr-only">
          Add a sub-task
        </label>
        <input
          id={`new-sub-${todoId}`}
          data-testid={`new-subtask-${todoId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="+ Add sub-task"
          maxLength={120}
          autoComplete="off"
          className="min-h-9 flex-1 rounded-lg border border-dashed border-blush-400 bg-transparent px-2 text-sm placeholder:text-plum-400 focus:border-petal-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Add sub-task"
          data-testid={`add-subtask-${todoId}`}
          className="min-h-9 rounded-lg border border-blush-300 px-2 text-sm text-plum-700 disabled:opacity-40 hover:bg-blush-200"
        >
          Add
        </button>
      </form>
    </section>
  );
}
