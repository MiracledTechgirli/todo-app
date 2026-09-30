import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Todo } from "../types";
import type { TodosApi } from "../hooks/useTodos";
import { TodoItem } from "./TodoItem";

interface Props {
  todos: Todo[];
  api: TodosApi;
}

/** Sortable, responsive list container. */
export function TodoList({ todos, api }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) api.reorder(String(active.id), String(over.id));
  };

  if (todos.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="blush-card rounded-2xl p-8 text-center"
        role="status"
      >
        <p className="text-plum-900 font-medium">Nothing here — enjoy the calm.</p>
        <p className="mt-1 text-sm text-plum-500">Add your first todo above.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul aria-label="Todo list" data-testid="todo-list" className="flex flex-col gap-2 sm:gap-3">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} api={api} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
