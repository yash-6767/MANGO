import React from 'react';
import { ExternalLink, Bookmark, CheckCircle2, AlertTriangle, Archive, Clock, Sparkles, Tag, ShieldCheck, AlertCircle } from 'lucide-react';
import { LearningResource } from '../../types/resources';
import { isNewResource, extractDomain, needsVerification } from '../../utils/resourceUtils';

interface ResourceCardProps {
  resource: LearningResource;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onEdit?: (resource: LearningResource) => void;
  onUpdateStatus?: (id: string, status: LearningResource['status']) => void;
  isAdmin?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
  onEdit,
  onUpdateStatus,
  isAdmin = false,
}) => {
  const isNew = isNewResource(resource.date_added);
  const requiresAudit = needsVerification(resource.last_verified);
  const domain = extractDomain(resource.url);

  // Difficulty badge styling
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[var(--sage-soft)] text-[var(--emerald-primary)] border-[var(--sage)]/40';
      case 'Intermediate':
        return 'bg-[var(--bg-primary)] text-[var(--sage-dark)] border-[var(--border-color)]';
      case 'Advanced':
        return 'bg-[var(--bg-muted)] text-[var(--emerald-deep)] border-[var(--border-color)]';
      default:
        return 'bg-[var(--bg-secondary)] text-[var(--text-main)] border-[var(--border-color)]';
    }
  };

  const getStatusBadge = (status: LearningResource['status']) => {
    switch (status) {
      case 'Active':
        return null;
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-warning)] border border-[var(--status-warning-border)]">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'Broken':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--status-danger-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-danger)] border border-[var(--status-danger-border)]">
            <AlertTriangle className="h-3 w-3" /> Broken URL
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border-color)]">
            <Archive className="h-3 w-3" /> Archived
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 hover:shadow-lg ${
        resource.status === 'Archived'
          ? 'opacity-70 bg-[var(--bg-secondary)] border-[var(--border-color)]'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--sage)]'
      } p-5 sm:p-6 text-[var(--text-main)]`}
    >
      {/* Top Bar: Provider, Domain, Badges & Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-bold text-[var(--sage-dark)] border border-[var(--border-color)]/60">
              {resource.provider}
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              {domain}
            </span>
            {isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald-primary)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white shadow-sm">
                <Sparkles className="h-3 w-3" /> NEW
              </span>
            )}
            {getStatusBadge(resource.status)}
            {requiresAudit && resource.status === 'Active' && (
              <span
                title="Last verified more than 90 days ago"
                className="inline-flex items-center gap-1 rounded-md bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-warning)] border border-[var(--status-warning-border)]"
              >
                <AlertCircle className="h-3 w-3" /> Needs Audit
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleBookmark(resource.id)}
            title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
            className={`rounded-xl p-2 transition ${
              isBookmarked
                ? 'bg-[var(--sage-soft)] text-[var(--emerald-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-main)]'
            }`}
            aria-label="Bookmark resource"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Category */}
        <div className="mt-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sage-dark)] border border-[var(--border-color)]">
              {resource.category}
            </span>
          </div>
          <h3 className="font-display mt-2 text-lg font-bold tracking-tight text-[var(--text-main)] group-hover:text-[var(--emerald-primary)] transition-colors">
            {resource.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3">
            {resource.description}
          </p>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--sage-dark)] border border-[var(--border-color)]/80"
              >
                <Tag className="h-2.5 w-2.5 opacity-60" />
                {tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="rounded-md bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                +{resource.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Paid features / disclosures if any */}
        {resource.paid_features && (
          <div className="mt-3 rounded-xl bg-[var(--bg-secondary)] p-2.5 border border-[var(--border-color)]/70 text-[11px] text-[var(--sage-dark)] leading-tight">
            <span className="font-bold text-[var(--text-main)]">Disclosure:</span> {resource.paid_features}
          </div>
        )}

        {/* Recommended Learning Path */}
        {resource.learning_path && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--emerald-primary)]">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{resource.learning_path}</span>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 border-t border-[var(--border-color)]/80 pt-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getDifficultyBadge(resource.difficulty)}`}>
              {resource.difficulty}
            </span>
            <span className="rounded-md border border-[var(--sage)]/60 bg-[var(--sage-soft)]/60 px-2 py-0.5 text-[10px] font-bold text-[var(--emerald-primary)]">
              {resource.free_status}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]" title={`Last verified: ${resource.last_verified}`}>
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--emerald-primary)]" />
            <span className="hidden sm:inline">Verified:</span>
            <span>{resource.last_verified}</span>
          </div>
        </div>

        {/* External Link Button & Admin actions */}
        <div className="mt-4 flex items-center gap-2">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--emerald-primary)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--emerald-deep)] active:scale-[0.98] shadow-sm"
          >
            <span>Open Resource</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {isAdmin && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(resource)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-muted)]"
                  title="Edit resource"
                >
                  Edit
                </button>
              )}
              {onUpdateStatus && resource.status !== 'Archived' && (
                <button
                  onClick={() => onUpdateStatus(resource.id, 'Archived')}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2.5 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                  title="Archive resource"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
