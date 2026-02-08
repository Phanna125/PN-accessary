type Category = { id: string; name: string }

type FiltersBarProps = {
  search: string
  onSearchChange: (value: string) => void
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  includeInactive: boolean
  onToggleInactive: (value: boolean) => void
  onClear: () => void
}

export function FiltersBar({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  includeInactive,
  onToggleInactive,
  onClear,
}: FiltersBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
      <div className="relative w-full">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products..."
          className="h-12 w-full rounded-xl border border-white/15 bg-[#232830] px-4 pl-10 text-sm text-white placeholder:text-white/40 focus:border-sky-400/70 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-12 min-w-[190px] rounded-xl border border-white/15 bg-[#232830] pl-8 pr-8 text-sm text-white focus:border-sky-400/70 focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/75">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => onToggleInactive(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-[#232830] text-sky-400 focus:ring-sky-400/30"
          />
          Show inactive
        </label>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="h-12 justify-self-start rounded-xl px-2 text-sm text-white/60 transition hover:text-white"
      >
        Clear filters
      </button>
    </div>
  )
}
