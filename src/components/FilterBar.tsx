import { useRef } from "react";
import type { Filter, SortOption } from "../types";

interface Props {
  filter: Filter;
  onChange: (f: Filter) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  active: number;
  done: number;
  total: number;
  onClearCompleted: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

const STATUS_OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

const CATEGORY_OPTIONS: string[] = ["All Categories", "Personal", "Work", "Shopping", "Ideas", "Health", "General"];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "manual", label: "Sort: Manual" },
  { value: "dueDate", label: "Sort: Due Date" },
  { value: "priority", label: "Sort: Priority" },
  { value: "createdAt", label: "Sort: Created" },
];

export function FilterBar({
  filter,
  onChange,
  categoryFilter,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  active,
  done,
  total,
  onClearCompleted,
  onExport,
  onImport,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onImport(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search and Sort row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">
            Search todos
          </label>
          <input
            id="search-input"
            data-testid="search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔍 Search todos..."
            className="w-full rounded-xl border border-blush-300 bg-white/70 px-3 py-1.5 text-sm text-plum-900 placeholder:text-plum-400 focus:border-petal-600 focus:outline-none"
          />
        </div>

        {/* Sort & Backup controls */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="sr-only">
            Sort options
          </label>
          <select
            id="sort-select"
            data-testid="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-xl border border-blush-300 bg-blush-50 px-2.5 py-1.5 text-xs text-plum-900 focus:border-petal-600 focus:outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            data-testid="export-json"
            onClick={onExport}
            className="rounded-xl border border-blush-300 bg-blush-50 px-2 py-1.5 text-xs font-medium text-plum-700 hover:bg-blush-200 transition"
            title="Export todos to JSON"
          >
            Export
          </button>
          <button
            type="button"
            data-testid="import-json"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-blush-300 bg-blush-50 px-2 py-1.5 text-xs font-medium text-plum-700 hover:bg-blush-200 transition"
            title="Import todos from JSON file"
          >
            Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
            aria-label="Upload JSON file"
          />
        </div>
      </div>

      {/* Category Pills bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="font-semibold text-plum-700 shrink-0">Tags:</span>
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            type="button"
            data-testid={`filter-cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 rounded-lg px-2.5 py-1 transition ${
              categoryFilter === cat
                ? "bg-petal-700 text-blush-50 font-medium"
                : "bg-blush-50 text-plum-600 hover:bg-blush-200 hover:text-plum-900 border border-blush-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status Filter & Counts row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter todos" className="inline-flex rounded-xl border border-blush-300 bg-blush-50 p-1">
          {STATUS_OPTIONS.map((o) => (
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
    </div>
  );
}

