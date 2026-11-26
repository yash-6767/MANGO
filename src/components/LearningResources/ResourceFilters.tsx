import React from 'react';
import { Search, Filter, X, ArrowUpDown, Bookmark, Sparkles } from 'lucide-react';
import { DifficultyLevel } from '../../types/resources';
import { RESOURCE_CATEGORIES } from '../../data/initialResources';
import { VALID_FREE_STATUSES } from '../../utils/resourceUtils';

export type SortOption = 'recent' | 'alphabetical' | 'category' | 'verified';

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedFreeStatus: string;
  onFreeStatusChange: (status: string) => void;
  newOnly: boolean;
  onNewOnlyChange: (newOnly: boolean) => void;
  bookmarkedOnly: boolean;
  onBookmarkedOnlyChange: (bookmarkedOnly: boolean) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedFreeStatus,
  onFreeStatusChange,
  newOnly,
  onNewOnlyChange,
  bookmarkedOnly,
  onBookmarkedOnlyChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
  categoryCounts,
  totalCount,
}) => {
  const difficulties: Array<'All' | DifficultyLevel> = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by topic, skill, provider, or title (e.g. 'LeetCode', 'System Design', 'Python')..."
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-3 pl-10 pr-10 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 outline-none transition focus:border-[var(--emerald-primary)] focus:ring-1 focus:ring-[var(--emerald-primary)] shadow-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdowns & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-3.5 pr-8 text-xs font-bold text-[var(--text-main)] outline-none transition hover:border-[var(--sage)] focus:border-[var(--emerald-primary)] shadow-sm cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              {difficulties.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>

          {/* Free Access Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedFreeStatus}
              onChange={(e) => onFreeStatusChange(e.target.value)}
              className="appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-3.5 pr-8 text-xs font-bold text-[var(--text-main)] outline-none transition hover:border-[var(--sage)] focus:border-[var(--emerald-primary)] shadow-sm cursor-pointer"
            >
              <option value="All">All Access Types</option>
              {VALID_FREE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-3.5 pr-8 text-xs font-bold text-[var(--text-main)] outline-none transition hover:border-[var(--sage)] focus:border-[var(--emerald-primary)] shadow-sm cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="verified">Last Verified</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
              <option value="category">Category</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>

          {/* Quick toggle chips: Bookmarked, NEW */}
          <button
            onClick={() => onBookmarkedOnlyChange(!bookmarkedOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition shadow-sm ${
              bookmarkedOnly
                ? 'border-[var(--emerald-primary)] bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--sage-dark)] hover:border-[var(--sage)]'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${bookmarkedOnly ? 'fill-current' : ''}`} />
            Saved Only
          </button>

          <button
            onClick={() => onNewOnlyChange(!newOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition shadow-sm ${
              newOnly
                ? 'border-[var(--emerald-primary)] bg-[var(--emerald-primary)] text-white'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--sage-dark)] hover:border-[var(--sage)]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            NEW (Last 30d)
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 rounded-xl border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2.5 text-xs font-bold text-[var(--status-danger)] transition hover:opacity-90"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 sidebar-scrollbar">
        <button
          onClick={() => onCategoryChange('All')}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
            selectedCategory === 'All'
              ? 'bg-[var(--emerald-primary)] text-white'
              : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--sage-dark)] hover:border-[var(--sage)] hover:text-[var(--text-main)]'
          }`}
        >
          All Topics ({totalCount})
        </button>

        {RESOURCE_CATEGORIES.map((category) => {
          const count = categoryCounts[category] || 0;
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                isSelected
                  ? 'bg-[var(--emerald-primary)] text-white'
                  : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--sage-dark)] hover:border-[var(--sage)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{category}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
