import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Plus,
  Upload,
  Bookmark,
  ShieldCheck,
  CheckCircle,
  Layers,
  Search,
} from 'lucide-react';
import { LearningResource } from '../../types/resources';
import { RESOURCE_CATEGORIES } from '../../data/initialResources';
import { ResourceCard } from './ResourceCard';
import { ResourceFilters, SortOption } from './ResourceFilters';
import { ResourceImportModal } from './ResourceImportModal';
import { ResourceFormModal } from './ResourceFormModal';
import { isNewResource, exportResourcesToJson } from '../../utils/resourceUtils';
import { resourceService } from '../../services/resourceService';

interface LearningResourcesViewProps {
  resources: LearningResource[];
  setResources: React.Dispatch<React.SetStateAction<LearningResource[]>>;
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  notify: (message: string) => void;
  isAdmin?: boolean;
}

export const LearningResourcesView: React.FC<LearningResourcesViewProps> = ({
  resources,
  setResources,
  bookmarkedIds,
  toggleBookmark,
  notify,
  isAdmin = false,
}) => {
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedFreeStatus, setSelectedFreeStatus] = useState('All');
  const [newOnly, setNewOnly] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Featured resources
  const featuredResources = useMemo(() => {
    return resources.filter((r) => r.is_featured && r.status === 'Active');
  }, [resources]);

  // Filtered & Sorted resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = resource.name.toLowerCase().includes(q);
          const matchDesc = resource.description.toLowerCase().includes(q);
          const matchProvider = resource.provider.toLowerCase().includes(q);
          const matchTags = resource.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchProvider && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && resource.category !== selectedCategory) {
          return false;
        }

        // Difficulty filter
        if (selectedDifficulty !== 'All' && resource.difficulty !== selectedDifficulty) {
          return false;
        }

        // Free status filter
        if (selectedFreeStatus !== 'All' && resource.free_status !== selectedFreeStatus) {
          return false;
        }

        // New only filter (< 30 days)
        if (newOnly && !isNewResource(resource.date_added)) {
          return false;
        }

        // Bookmarked only filter
        if (bookmarkedOnly && !bookmarkedIds.includes(resource.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'alphabetical':
            return a.name.localeCompare(b.name);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'verified':
            return new Date(b.last_verified).getTime() - new Date(a.last_verified).getTime();
          case 'recent':
          default:
            return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
        }
      });
  }, [resources, search, selectedCategory, selectedDifficulty, selectedFreeStatus, newOnly, bookmarkedOnly, sortBy, bookmarkedIds]);

  const hasActiveFilters = Boolean(
    search || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedFreeStatus !== 'All' || newOnly || bookmarkedOnly
  );

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedFreeStatus('All');
    setNewOnly(false);
    setBookmarkedOnly(false);
  };

  // Actions
  const handleBatchImport = async (newItems: LearningResource[]) => {
    setResources((prev) => [...newItems, ...prev]);
    const res = await resourceService.batchSaveResources(newItems, isAdmin);
    if (res.isCloudSynced) {
      notify(`Successfully published ${newItems.length} verified resources to global library!`);
    } else {
      notify(`Imported ${newItems.length} verified resources to your workspace library.`);
    }
  };

  const handleSaveResource = async (saved: LearningResource) => {
    setResources((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) {
        return prev.map((r) => (r.id === saved.id ? saved : r));
      }
      return [saved, ...prev];
    });
    const res = await resourceService.saveResource(saved, isAdmin);
    if (!res.success) {
      notify(`Saved locally. ${res.error || 'Cloud sync restricted to admins'}`);
    } else if (res.isCloudSynced) {
      notify('Resource published to the global curated library!');
    } else {
      notify(editingResource ? 'Resource updated in personal library' : 'New resource added to personal library');
    }
    setEditingResource(null);
  };

  const handleUpdateStatus = async (id: string, status: LearningResource['status']) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const item = resources.find((r) => r.id === id);
    if (item && isAdmin) {
      await resourceService.saveResource({ ...item, status }, true);
    }
    notify(`Resource status updated to ${status}`);
  };

  const handleExportJson = () => {
    const jsonStr = exportResourcesToJson(resources);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangos_learning_resources_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Exported learning resources JSON file');
  };

  const totalActive = resources.filter((r) => r.status === 'Active').length;
  const totalFree = resources.filter((r) => r.free_status.includes('100% Free') || r.free_status === 'Free').length;
  const totalNew = resources.filter((r) => isNewResource(r.date_added)).length;

  return (
    <div className="space-y-8 text-[var(--text-main)]">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sage)]/50 bg-[var(--sage-soft)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[.18em] text-[var(--emerald-primary)]">
            <BookOpen className="h-3.5 w-3.5" /> Curated Learning Library
          </div>
          <h2 className="font-display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[var(--text-main)] sm:text-[36px]">
            Master the fundamentals.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Verified free resources, roadmaps, university courses, and practice platforms curated specifically for students preparing for software engineering careers.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-secondary)] shadow-sm transition"
          >
            <Upload className="h-3.5 w-3.5 text-[var(--emerald-primary)]" />
            Import (JSON)
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-secondary)] shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5 text-[var(--sage-dark)]" />
            Export
          </button>

          <button
            onClick={() => {
              setEditingResource(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--emerald-deep)] shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl p-2.5 bg-[var(--sage-soft)] text-[var(--emerald-primary)]">
              <Layers className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Resources</span>
          </div>
          <p className="font-display mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-main)]">{totalActive}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">across {RESOURCE_CATEGORIES.length} tech categories</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl p-2.5 bg-[var(--sage-soft)] text-[var(--emerald-primary)]">
              <CheckCircle className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">100% Free Materials</span>
          </div>
          <p className="font-display mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-main)]">{totalFree}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">no paywalls on core learning</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl p-2.5 bg-[var(--bg-muted)] text-[var(--emerald-deep)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">New This Month</span>
          </div>
          <p className="font-display mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-main)]">{totalNew}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">added in last 30 days</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl p-2.5 bg-[var(--bg-primary)] text-[var(--sage-dark)]">
              <Bookmark className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Your Bookmarks</span>
          </div>
          <p className="font-display mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-main)]">{bookmarkedIds.length}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">saved for quick study</p>
        </div>
      </div>

      {/* Featured Resources Section (when no active filters) */}
      {!hasActiveFilters && featuredResources.length > 0 && (
        <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--emerald-primary)]">
                <Sparkles className="h-3.5 w-3.5" /> High-Impact Starters
              </div>
              <h3 className="font-display mt-1 text-xl font-extrabold text-[var(--text-main)]">
                Essential Foundations for SWE Internships & Roles
              </h3>
            </div>
            <span className="rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-1 text-xs font-bold text-[var(--sage-dark)]">
              Top {featuredResources.length} Curated
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredResources.slice(0, 3).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                isBookmarked={bookmarkedIds.includes(res.id)}
                onToggleBookmark={toggleBookmark}
                onEdit={(r) => {
                  setEditingResource(r);
                  setShowFormModal(true);
                }}
                onUpdateStatus={handleUpdateStatus}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Filter & Library Section */}
      <section className="space-y-6">
        <ResourceFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedFreeStatus={selectedFreeStatus}
          onFreeStatusChange={setSelectedFreeStatus}
          newOnly={newOnly}
          onNewOnlyChange={setNewOnly}
          bookmarkedOnly={bookmarkedOnly}
          onBookmarkedOnlyChange={setBookmarkedOnly}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          categoryCounts={categoryCounts}
          totalCount={resources.length}
        />

        {/* Search Results Count & Status */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 text-xs text-[var(--text-muted)]">
          <span>
            Showing <strong className="text-[var(--text-main)]">{filteredResources.length}</strong> {filteredResources.length === 1 ? 'resource' : 'resources'}
            {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
            {selectedFreeStatus !== 'All' && <span> ({selectedFreeStatus})</span>}
          </span>
          <span className="hidden sm:inline">
            Sorted by {sortBy === 'recent' ? 'Recently Added' : sortBy === 'verified' ? 'Last Verified' : sortBy === 'alphabetical' ? 'A-Z' : 'Category'}
          </span>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isBookmarked={bookmarkedIds.includes(resource.id)}
                onToggleBookmark={toggleBookmark}
                onEdit={(r) => {
                  setEditingResource(r);
                  setShowFormModal(true);
                }}
                onUpdateStatus={handleUpdateStatus}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] py-16 px-6 text-center shadow-sm">
            <span className="inline-flex rounded-2xl bg-[var(--bg-secondary)] p-4 text-[var(--sage-dark)] border border-[var(--border-color)]">
              <Search className="h-6 w-6" />
            </span>
            <h4 className="font-display mt-4 text-lg font-bold text-[var(--text-main)]">No resources match your filters</h4>
            <p className="mt-2 text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              We couldn't find any resources matching your current search terms or category selection.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)]"
              >
                Clear all filters
              </button>
              <button
                onClick={() => {
                  setEditingResource(null);
                  setShowFormModal(true);
                }}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-secondary)]"
              >
                Suggest this resource
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Monthly Verification & Criteria Explainer Card */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-xs text-[var(--sage-dark)]">
        <div className="flex items-center gap-2 font-bold text-[var(--emerald-primary)] mb-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-[var(--emerald-primary)]" />
          Monthly Verification Standard & Automation Pipeline
        </div>
        <p className="leading-relaxed text-[var(--text-muted)]">
          Every resource in this library is audited on a 30-day recurring schedule for active links, educational value, and free-tier access. Resources added within 30 days automatically display the <span className="font-bold text-[var(--emerald-primary)]">NEW</span> badge. Outdated links are archived rather than deleted to maintain bookmark continuity. New batches can be imported via structured JSON anytime without code modifications.
        </p>
      </section>

      {/* Modals */}
      {showImportModal && (
        <ResourceImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleBatchImport}
          existingResources={resources}
        />
      )}

      {showFormModal && (
        <ResourceFormModal
          onClose={() => {
            setShowFormModal(false);
            setEditingResource(null);
          }}
          onSave={handleSaveResource}
          initialResource={editingResource}
        />
      )}
    </div>
  );
};
