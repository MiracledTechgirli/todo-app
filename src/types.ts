export interface SubTask {
  id: string;
  title: string;
  done: boolean;
  /** optional longer note — composable description slot */
  description?: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: number;
  subtasks: SubTask[];
}

export type Filter = "all" | "active" | "done";

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}
