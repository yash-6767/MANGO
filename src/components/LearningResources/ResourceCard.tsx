import React from 'react';
import { ExternalLink, Bookmark, CheckCircle2, AlertTriangle, Archive, Clock, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { LearningResource } from '../../types/resources';
import { isNewResource, extractDomain } from '../../utils/resourceUtils';

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
  const domain = extractDomain(resource.url);

  // Difficulty badge styling
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#DCE6D8] text-[#176B50] border-[#A8B5A0]/40';
      case 'Intermediate':
        return 'bg-[#F4F0E6] text-[#5F7563] border-[#DDDCCF]';
      case 'Advanced':
        return 'bg-[#E6DDC8] text-[#104C3A] border-[#DDDCCF]';
      default:
        return 'bg-[#FAF8F2] text-[#24332B] border-[#DDDCCF]';
    }
  };

  const getStatusBadge = (status: LearningResource['status']) => {
    switch (status) {
      case 'Active':
        return null;
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'Broken':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
            <AlertTriangle className="h-3 w-3" /> Broken URL
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 border border-stone-200">
            <Archive className="h-3 w-3" /> Archived
          </span>
        );
    }
  };

  return (
    <div className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 hover:shadow-lg ${
      resource.status === 'Archived' 
        ? 'opacity-70 bg-[#FAF8F2] border-[#DDDCCF]' 
        : 'bg-white border-[#DDDCCF] hover:border-[#A8B5A0]'
    } p-5 sm:p-6`}>
      {/* Top Bar: Provider, Domain, Badges & Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#FAF8F2] px-2.5 py-1 text-xs font-bold text-[#5F7563] border border-[#DDDCCF]/60">
              {resource.provider}
            </span>
            <span className="text-[11px] font-medium text-[#68766C]">
              {domain}
            </span>
            {isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#176B50] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white shadow-sm">
                <Sparkles className="h-3 w-3" /> NEW
              </span>
            )}
            {getStatusBadge(resource.status)}
          </div>

          <button
            onClick={() => onToggleBookmark(resource.id)}
            title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
            className={`rounded-xl p-2 transition ${
              isBookmarked
                ? 'bg-[#DCE6D8] text-[#176B50]'
                : 'text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]'
            }`}
            aria-label="Bookmark resource"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Category */}
        <div className="mt-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-md bg-[#FAF8F2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5F7563] border border-[#DDDCCF]">
              {resource.category}
            </span>
          </div>
          <h3 className="font-display mt-2 text-lg font-bold tracking-tight text-[#24332B] group-hover:text-[#176B50] transition-colors">
            {resource.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#68766C] line-clamp-3">
            {resource.description}
          </p>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-[#FAF8F2] px-2 py-0.5 text-[11px] font-medium text-[#5F7563] border border-[#DDDCCF]/80"
              >
                <Tag className="h-2.5 w-2.5 opacity-60" />
                {tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="rounded-md bg-[#FAF8F2] px-1.5 py-0.5 text-[10px] font-semibold text-[#68766C]">
                +{resource.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Paid features / disclosures if any */}
        {resource.paid_features && (
          <div className="mt-3 rounded-xl bg-[#FAF8F2] p-2.5 border border-[#DDDCCF]/70 text-[11px] text-[#5F7563] leading-tight">
            <span className="font-bold text-[#24332B]">Disclosure:</span> {resource.paid_features}
          </div>
        )}

        {/* Recommended Learning Path */}
        {resource.learning_path && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[#176B50]">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{resource.learning_path}</span>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 border-t border-[#DDDCCF]/80 pt-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getDifficultyBadge(resource.difficulty)}`}>
              {resource.difficulty}
            </span>
            <span className="rounded-md border border-[#A8B5A0]/60 bg-[#DCE6D8]/60 px-2 py-0.5 text-[10px] font-bold text-[#176B50]">
              {resource.free_status}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#68766C]" title={`Last verified: ${resource.last_verified}`}>
            <ShieldCheck className="h-3.5 w-3.5 text-[#176B50]" />
            <span className="hidden sm:inline">Verified:</span>
            <span>{resource.last_verified.substring(5)}</span>
          </div>
        </div>

        {/* External Link Button & Admin actions */}
        <div className="mt-4 flex items-center gap-2">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#176B50] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#104C3A] active:scale-[0.98] shadow-sm"
          >
            <span>Open Resource</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {isAdmin && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(resource)}
                  className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3 py-2.5 text-xs font-bold text-[#24332B] hover:bg-[#E6DDC8]"
                  title="Edit resource"
                >
                  Edit
                </button>
              )}
              {onUpdateStatus && resource.status !== 'Archived' && (
                <button
                  onClick={() => onUpdateStatus(resource.id, 'Archived')}
                  className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-2.5 text-xs font-bold text-[#68766C] hover:bg-[#E6DDC8]"
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
