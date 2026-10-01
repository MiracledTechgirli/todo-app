import { useCallback, useEffect, useMemo, useState } from "react";
import { uid, type Todo, type Priority, type Category } from "../types";

const STORAGE_KEY = "pink-todos-v1";

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Todo[];
    if (!Array.isArray(parsed)) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

function seed(): Todo[] {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  return [
    {
      id: uid("todo"),
      title: "Plan the week",
      description: "Keep it minimal — three things that matter.",
      done: false,
      createdAt: Date.now() - 3000,
      priority: "high",
      category: "Personal",
      dueDate: today,
      pinned: true,
      subtasks: [
        { id: uid("sub"), title: "Buy pink folders", done: false },
        { id: uid("sub"), title: "Sketch pink palette", done: true },
      ],
    },
    {
      id: uid("todo"),
      title: "Read 20 pages",
      description: "Finish the current chapter on UI design.",
      done: false,
      createdAt: Date.now() - 2000,
      priority: "medium",
      category: "Ideas",
      dueDate: nextWeek,
      subtasks: [],
    },
  ];
}

export interface AddTodoOptions {
  priority?: Priority;
  dueDate?: string;
  category?: Category;
  pinned?: boolean;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* ignore quota errors */
    }
  }, [todos]);

  const addTodo = useCallback(
    (title: string, description: string, options?: AddTodoOptions) => {
      const t = title.trim();
      if (!t) return null;
      const todo: Todo = {
        id: uid("todo"),
        title: t.slice(0, 120),
        description: description.trim().slice(0, 500),
        done: false,
        createdAt: Date.now(),
        subtasks: [],
        priority: options?.priority ?? "medium",
        dueDate: options?.dueDate || undefined,
        category: options?.category ?? "General",
        pinned: options?.pinned ?? false,
      };
      setTodos((prev) => [todo, ...prev]);
      return todo;
    },
    []
  );

  const updateTodo = useCallback(
    (
      id: string,
      patch: Partial<Pick<Todo, "title" | "description" | "priority" | "dueDate" | "category" | "pinned">>
    ) => {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: patch.title !== undefined ? patch.title.slice(0, 120) : t.title,
                description: patch.description !== undefined ? patch.description.slice(0, 500) : t.description,
                priority: patch.priority !== undefined ? patch.priority : t.priority,
                dueDate: patch.dueDate !== undefined ? patch.dueDate : t.dueDate,
                category: patch.category !== undefined ? patch.category : t.category,
                pinned: patch.pinned !== undefined ? patch.pinned : t.pinned,
              }
            : t
        )
      );
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const togglePin = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
  }, []);

  const reorder = useCallback((activeId: string, overId: string) => {
    setTodos((prev) => {
      const from = prev.findIndex((t) => t.id === activeId);
      const to = prev.findIndex((t) => t.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  // --- subtasks (composable CRUD) ---
  const addSubtask = useCallback((todoId: string, title: string, description = "") => {
    const t = title.trim();
    if (!t) return;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                ...todo.subtasks,
                { id: uid("sub"), title: t.slice(0, 120), done: false, description: description.slice(0, 300) || undefined },
              ],
            }
          : todo
      )
    );
  }, []);

  const toggleSubtask = useCallback((todoId: string, subId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
            }
          : todo
      )
    );
  }, []);

  const updateSubtask = useCallback((todoId: string, subId: string, title: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((s) =>
                s.id === subId ? { ...s, title: title.slice(0, 120) } : s
              ),
            }
          : todo
      )
    );
  }, []);

  const deleteSubtask = useCallback((todoId: string, subId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, subtasks: todo.subtasks.filter((s) => s.id !== subId) }
          : todo
      )
    );
  }, []);

  const exportTodos = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pink-todos-export-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [todos]);

  const importTodos = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed)) {
        setTodos(parsed);
        return true;
      }
    } catch {
      /* ignore invalid json */
    }
    return false;
  }, []);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    return { total, done, active: total - done };
  }, [todos]);

  return {
    todos,
    stats,
    addTodo,
    updateTodo,
    toggleTodo,
    togglePin,
    deleteTodo,
    clearCompleted,
    reorder,
    addSubtask,
    toggleSubtask,
    updateSubtask,
    deleteSubtask,
    exportTodos,
    importTodos,
  };
}

export type TodosApi = ReturnType<typeof useTodos>;

