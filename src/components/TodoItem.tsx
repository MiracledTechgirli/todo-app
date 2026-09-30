import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Todo } from "../types";
import type { TodosApi } from "../hooks/useTodos";
import { SubTaskList } from "./SubTaskList";

interface Props {
  todo: Todo;
  api: TodosApi;
}

/** Single sortable todo card. Composable: description + subtasks render in its body slot. */
export function TodoItem({ todo, api }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [showSubs, setShowSubs] = useState(todo.subtasks.length > 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    api.updateTodo(todo.id, { title: title.trim(), description });
    setEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid={`todo-${todo.id}`}
      className={`blush-card rounded-2xl p-3 sm:p-4 ${isDragging ? "dragging-card opacity-90" : ""}`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${todo.title}`}
          data-testid={`drag-${todo.id}`}
          className="mt-1 cursor-grab touch-none rounded p-1 text-plum-400 select-none hover:bg-blush-200 hover:text-plum-700 active:cursor-grabbing"
        >
          <span aria-hidden="true">⠿</span>
        </button>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => api.toggleTodo(todo.id)}
          aria-label={`Mark ${todo.title} as ${todo.done ? "not done" : "done"}`}
          data-testid={`toggle-${todo.id}`}
          className="mt-1.5 h-5 w-5 shrink-0 accent-petal-700"
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={save} aria-label={`Edit ${todo.title}`} className="flex flex-col gap-2">
              <label htmlFor={`edit-title-${todo.id}`} className="sr-only">
                Todo title
              </label>
              <input
                id={`edit-title-${todo.id}`}
                data-testid={`edit-title-${todo.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                autoFocus
                className="min-h-10 rounded-lg border border-petal-500 bg-white px-2 text-[15px]"
              />
              <label htmlFor={`edit-desc-${todo.id}`} className="sr-only">
                Todo description
              </label>
              <textarea
                id={`edit-desc-${todo.id}`}
                data-testid={`edit-desc-${todo.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Description"
                className="rounded-lg border border-blush-300 bg-white px-2 py-1 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  data-testid={`save-${todo.id}`}
                  className="min-h-9 rounded-lg bg-plum-900 px-3 text-sm text-blush-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setTitle(todo.title);
                    setDescription(todo.description);
                  }}
                  className="min-h-9 rounded-lg border border-blush-300 px-3 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3
                data-testid={`title-${todo.id}`}
                className={`text-[15px] font-medium break-words ${todo.done ? "text-plum-400 line-through" : "text-plum-900"}`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p data-testid={`desc-${todo.id}`} className="mt-0.5 text-sm break-words text-plum-500">
                  {todo.description}
                </p>
              )}
              {/* composable body slot: sub-tasks */}
              {(showSubs || todo.subtasks.length > 0) && (
                <SubTaskList
                  todoId={todo.id}
                  subtasks={todo.subtasks}
                  onAdd={api.addSubtask}
                  onToggle={api.toggleSubtask}
                  onUpdate={api.updateSubtask}
                  onDelete={api.deleteSubtask}
                />
              )}
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
          {!editing && (
            <>
              <button
                type="button"
                aria-label={showSubs ? `Hide sub-tasks for ${todo.title}` : `Show sub-tasks for ${todo.title}`}
                aria-expanded={showSubs || todo.subtasks.length > 0}
                onClick={() => setShowSubs((v) => !v)}
                className="rounded-lg border border-blush-300 px-2 py-1 text-xs text-plum-500 hover:bg-blush-200 hover:text-plum-900"
              >
                {todo.subtasks.length > 0 ? `${todo.subtasks.length} ▾` : "+"}
              </button>
              <button
                type="button"
                aria-label={`Edit ${todo.title}`}
                data-testid={`edit-${todo.id}`}
                onClick={() => {
                  setTitle(todo.title);
                  setDescription(todo.description);
                  setEditing(true);
                }}
                className="rounded-lg border border-blush-300 px-2 py-1 text-xs text-plum-500 hover:bg-blush-200 hover:text-plum-900"
              >
                Edit
              </button>
              <button
                type="button"
                aria-label={`Delete ${todo.title}`}
                data-testid={`delete-${todo.id}`}
                onClick={() => api.deleteTodo(todo.id)}
                className="rounded-lg border border-blush-300 px-2 py-1 text-xs text-plum-500 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
