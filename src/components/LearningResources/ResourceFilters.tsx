import React from 'react';
import { Search, Filter, X, ArrowUpDown, Bookmark, Sparkles } from 'lucide-react';
import { ResourceCategory, DifficultyLevel } from '../../types/resources';
import { RESOURCE_CATEGORIES } from '../../data/initialResources';

export type SortOption = 'recent' | 'alphabetical' | 'category' | 'verified';

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  freeOnly: boolean;
  onFreeOnlyChange: (freeOnly: boolean) => void;
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
  freeOnly,
  onFreeOnlyChange,
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
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#68766C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by topic, skill, provider, or title (e.g. 'LeetCode', 'System Design', 'Python')..."
            className="w-full rounded-xl border border-[#DDDCCF] bg-white py-3 pl-10 pr-10 text-sm text-[#24332B] placeholder:text-[#68766C]/70 outline-none transition focus:border-[#176B50] focus:ring-1 focus:ring-[#176B50] shadow-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3 rounded-lg p-1 text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]"
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
              className="appearance-none rounded-xl border border-[#DDDCCF] bg-white py-2.5 pl-3.5 pr-8 text-xs font-bold text-[#24332B] outline-none transition hover:border-[#A8B5A0] focus:border-[#176B50] shadow-sm cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              {difficulties.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-[#68766C]" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="appearance-none rounded-xl border border-[#DDDCCF] bg-white py-2.5 pl-3.5 pr-8 text-xs font-bold text-[#24332B] outline-none transition hover:border-[#A8B5A0] focus:border-[#176B50] shadow-sm cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="verified">Last Verified</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
              <option value="category">Category</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-[#68766C]" />
          </div>

          {/* Quick toggle chips: Bookmarked, 100% Free, NEW */}
          <button
            onClick={() => onBookmarkedOnlyChange(!bookmarkedOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition shadow-sm ${
              bookmarkedOnly
                ? 'border-[#176B50] bg-[#DCE6D8] text-[#176B50]'
                : 'border-[#DDDCCF] bg-white text-[#5F7563] hover:border-[#A8B5A0]'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${bookmarkedOnly ? 'fill-current' : ''}`} />
            Saved Only
          </button>

          <button
            onClick={() => onFreeOnlyChange(!freeOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition shadow-sm ${
              freeOnly
                ? 'border-[#176B50] bg-[#DCE6D8] text-[#176B50]'
                : 'border-[#DDDCCF] bg-white text-[#5F7563] hover:border-[#A8B5A0]'
            }`}
          >
            100% Free Only
          </button>

          <button
            onClick={() => onNewOnlyChange(!newOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition shadow-sm ${
              newOnly
                ? 'border-[#176B50] bg-[#176B50] text-white'
                : 'border-[#DDDCCF] bg-white text-[#5F7563] hover:border-[#A8B5A0]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            NEW (Last 30d)
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
        <button
          onClick={() => onCategoryChange('All')}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
            selectedCategory === 'All'
              ? 'bg-[#176B50] text-white'
              : 'border border-[#DDDCCF] bg-white text-[#5F7563] hover:border-[#A8B5A0] hover:text-[#24332B]'
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
                  ? 'bg-[#176B50] text-white'
                  : 'border border-[#DDDCCF] bg-white text-[#5F7563] hover:border-[#A8B5A0] hover:text-[#24332B]'
              }`}
            >
              <span>{category}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[#FAF8F2] text-[#68766C]'
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
