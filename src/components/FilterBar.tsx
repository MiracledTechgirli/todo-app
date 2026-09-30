import type { Filter } from "../types";

interface Props {
  filter: Filter;
  onChange: (f: Filter) => void;
  active: number;
  done: number;
  total: number;
  onClearCompleted: () => void;
}

const OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

export function FilterBar({ filter, onChange, active, done, total, onClearCompleted }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div role="group" aria-label="Filter todos" className="inline-flex rounded-xl border border-blush-300 bg-blush-50 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={filter === o.value}
            data-testid={`filter-${o.value}`}
            onClick={() => onChange(o.value)}
            className={`min-h-9 rounded-lg px-3 text-sm font-medium transition ${
              filter === o.value ? "bg-plum-900 text-blush-50" : "text-plum-500 hover:text-plum-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p data-testid="counts" aria-live="polite" className="text-xs text-plum-500">
          {active} active · {done} done · {total} total
        </p>
        {done > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            data-testid="clear-completed"
            className="min-h-8 rounded-lg border border-blush-300 px-2 text-xs text-plum-500 hover:bg-blush-200 hover:text-plum-900"
          >
            Clear done
          </button>
        )}
      </div>
    </div>
  );
}
