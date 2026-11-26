import {
  LearningResource,
  ResourceCategory,
  ResourceImportPayload,
  ImportPreviewResult,
  DuplicateDetectionResult,
  ValidationIssue,
  DifficultyLevel,
  FreeStatus,
  ResourceStatus,
} from '../types/resources';
import { RESOURCE_CATEGORIES } from '../data/initialResources';

/**
 * Normalizes a URL for robust comparison:
 * - strips protocol (http/https)
 * - converts hostname to lowercase
 * - removes www.
 * - removes common tracking parameters (utm_*, ref, etc.)
 * - removes trailing slash
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    let clean = rawUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    // remove tracking params
    const searchParams = new URLSearchParams(parsed.search);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'];
    trackingParams.forEach((param) => searchParams.delete(param));

    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const search = searchParams.toString();
    return `${hostname}${pathname}${search ? '?' + search : ''}`.toLowerCase();
  } catch {
    return rawUrl.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

/**
 * Extracts a clean domain name for display or matching.
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Checks if a resource was added within the last 30 days.
 */
export function isNewResource(dateAddedStr: string): boolean {
  if (!dateAddedStr) return false;
  try {
    const addedTime = new Date(dateAddedStr).getTime();
    if (isNaN(addedTime)) return false;
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return now >= addedTime && now - addedTime <= thirtyDaysMs;
  } catch {
    return false;
  }
}

/**
 * Checks if a candidate resource is a duplicate of any existing resource.
 */
export function findDuplicate(
  candidate: { name: string; url: string; provider?: string },
  existing: LearningResource[]
): DuplicateDetectionResult | null {
  const normCandidateUrl = normalizeUrl(candidate.url);
  const candidateName = candidate.name.trim().toLowerCase();
  const candidateProvider = (candidate.provider || '').trim().toLowerCase();

  for (const item of existing) {
    // 1. Exact raw URL match
    if (item.url.trim().toLowerCase() === candidate.url.trim().toLowerCase()) {
      return { resource: item, matchedWith: item, matchReason: 'exact_url' };
    }
    // 2. Normalized URL match
    if (normalizeUrl(item.url) === normCandidateUrl) {
      return { resource: item, matchedWith: item, matchReason: 'normalized_url' };
    }
    // 3. Exact name match
    if (item.name.trim().toLowerCase() === candidateName) {
      return { resource: item, matchedWith: item, matchReason: 'exact_name' };
    }
    // 4. Name & Provider match
    if (
      candidateProvider &&
      item.provider.trim().toLowerCase() === candidateProvider &&
      item.name.trim().toLowerCase().includes(candidateName)
    ) {
      return { resource: item, matchedWith: item, matchReason: 'name_and_provider' };
    }
  }

  return null;
}

/**
 * Validates and previews a monthly JSON import payload against existing resources.
 */
export function validateAndPreviewImport(
  rawJson: string | object,
  existingResources: LearningResource[]
): { success: boolean; preview?: ImportPreviewResult; error?: string } {
  let parsed: unknown;
  try {
    parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  } catch (err) {
    return { success: false, error: 'Invalid JSON syntax: ' + (err instanceof Error ? err.message : String(err)) };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { success: false, error: 'JSON payload must be an object containing a "resources" array.' };
  }

  const payload = parsed as Partial<ResourceImportPayload>;
  const rawList = Array.isArray(payload.resources) ? payload.resources : Array.isArray(parsed) ? parsed : null;

  if (!rawList) {
    return {
      success: false,
      error: 'Missing "resources" array. Format: { "resources": [ { "name": "...", "url": "...", ... } ] }',
    };
  }

  if (rawList.length === 0) {
    return { success: false, error: 'The resources array is empty.' };
  }

  const toAdd: LearningResource[] = [];
  const duplicates: DuplicateDetectionResult[] = [];
  const errors: ValidationIssue[] = [];
  const seenBatchUrls = new Set<string>();
  const seenBatchNames = new Set<string>();

  const todayStr = new Date().toISOString().split('T')[0];

  rawList.forEach((raw, idx) => {
    const item = raw as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    const provider = typeof item.provider === 'string' ? item.provider.trim() : '';
    const description = typeof item.description === 'string' ? item.description.trim() : '';
    const categoryRaw = typeof item.category === 'string' ? item.category.trim() : '';

    if (!name) {
      errors.push({ index: idx, field: 'name', message: 'Resource name is required.' });
    }
    if (!url) {
      errors.push({ index: idx, name, field: 'url', message: 'Resource official URL is required.' });
    } else {
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        errors.push({ index: idx, name, field: 'url', message: 'Invalid URL format.' });
      }
    }
    if (!description) {
      errors.push({ index: idx, name, field: 'description', message: 'Short description is required.' });
    }
    if (!provider) {
      errors.push({ index: idx, name, field: 'provider', message: 'Provider/Organization is required.' });
    }

    // Match or fallback category
    let category: ResourceCategory = 'Computer Science Fundamentals';
    if (categoryRaw && RESOURCE_CATEGORIES.includes(categoryRaw as ResourceCategory)) {
      category = categoryRaw as ResourceCategory;
    } else if (categoryRaw) {
      // Find case-insensitive partial match
      const matched = RESOURCE_CATEGORIES.find((cat) => cat.toLowerCase() === categoryRaw.toLowerCase());
      if (matched) {
        category = matched;
      }
    }

    // Duplicate check within batch
    const normUrl = normalizeUrl(url);
    const normName = name.toLowerCase();

    if (seenBatchUrls.has(normUrl) || seenBatchNames.has(normName)) {
      duplicates.push({
        resource: {
          id: `batch-dup-${idx}`,
          name,
          url,
          provider: provider || 'Unknown',
          description: description || '',
          category,
          tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
          difficulty: (item.difficulty as DifficultyLevel) || 'Beginner',
          free_status: (item.free_status as FreeStatus) || 'Free',
          date_added: (item.date_added as string) || todayStr,
          last_verified: (item.last_verified as string) || todayStr,
          status: (item.status as ResourceStatus) || 'Active',
        },
        matchedWith: {
          id: 'batch-earlier',
          name,
          url,
          provider: provider || 'Unknown',
          description: '',
          category,
          tags: [],
          difficulty: 'Beginner',
          free_status: 'Free',
          date_added: todayStr,
          last_verified: todayStr,
          status: 'Active',
        },
        matchReason: 'normalized_url',
      });
      return;
    }

    seenBatchUrls.add(normUrl);
    seenBatchNames.add(normName);

    // Duplicate check against existing library
    const dupMatch = findDuplicate({ name, url, provider }, existingResources);
    if (dupMatch) {
      duplicates.push({
        resource: {
          id: `dup-${idx}`,
          name,
          url,
          provider: provider || dupMatch.matchedWith.provider,
          description: description || dupMatch.matchedWith.description,
          category,
          tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
          difficulty: (item.difficulty as DifficultyLevel) || 'Beginner',
          free_status: (item.free_status as FreeStatus) || 'Free',
          date_added: (item.date_added as string) || todayStr,
          last_verified: (item.last_verified as string) || todayStr,
          status: (item.status as ResourceStatus) || 'Active',
        },
        matchedWith: dupMatch.matchedWith,
        matchReason: dupMatch.matchReason,
      });
      return;
    }

    if (name && url && description && provider) {
      const difficulty: DifficultyLevel = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(
        item.difficulty as string
      )
        ? (item.difficulty as DifficultyLevel)
        : 'All Levels';

      const free_status: FreeStatus = [
        '100% Free',
        'Free Course',
        'Free with Optional Certificate',
        'Free Tier Available',
        'Free',
      ].includes(item.free_status as string)
        ? (item.free_status as FreeStatus)
        : 'Free';

      const status: ResourceStatus = ['Active', 'Under Review', 'Broken', 'Archived'].includes(item.status as string)
        ? (item.status as ResourceStatus)
        : 'Active';

      const newResource: LearningResource = {
        id: `res-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        description,
        url,
        provider,
        category,
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
        difficulty,
        free_status,
        paid_features: typeof item.paid_features === 'string' ? item.paid_features : undefined,
        date_added: typeof item.date_added === 'string' ? item.date_added : todayStr,
        last_verified: typeof item.last_verified === 'string' ? item.last_verified : todayStr,
        status,
        learning_path: typeof item.learning_path === 'string' ? item.learning_path : undefined,
        is_featured: Boolean(item.is_featured),
      };

      toAdd.push(newResource);
    }
  });

  return {
    success: true,
    preview: {
      validCount: toAdd.length,
      duplicateCount: duplicates.length,
      errorCount: errors.length,
      toAdd,
      duplicates,
      errors,
    },
  };
}

/**
 * Serializes the current resources into formatted JSON for export or monthly archive.
 */
export function exportResourcesToJson(resources: LearningResource[]): string {
  const exportPayload: ResourceImportPayload = {
    resources: resources.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      provider: r.provider,
      category: r.category,
      tags: r.tags,
      difficulty: r.difficulty,
      free_status: r.free_status,
      paid_features: r.paid_features,
      date_added: r.date_added,
      last_verified: r.last_verified,
      status: r.status,
      learning_path: r.learning_path,
      is_featured: r.is_featured,
    })),
  };
  return JSON.stringify(exportPayload, null, 2);
}
