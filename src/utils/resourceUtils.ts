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

export const VALID_DIFFICULTIES: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export const VALID_FREE_STATUSES: FreeStatus[] = [
  '100% Free',
  'Free Course',
  'Free with Optional Certificate',
  'Free Tier Available',
  'Free',
];

export const VALID_STATUSES: ResourceStatus[] = ['Active', 'Under Review', 'Broken', 'Archived'];

/**
 * Normalizes a URL for comparison:
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
    // Remove analytics & tracking parameters
    const searchParams = new URLSearchParams(parsed.search);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source', 'fbclid', 'gclid'];
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
 * Validates date string in YYYY-MM-DD format.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
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
 * Checks if a resource needs verification (> 90 days since last verification).
 */
export function needsVerification(lastVerifiedStr: string): boolean {
  if (!lastVerifiedStr) return true;
  try {
    const verifiedTime = new Date(lastVerifiedStr).getTime();
    if (isNaN(verifiedTime)) return true;
    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    return now - verifiedTime > ninetyDaysMs;
  } catch {
    return true;
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
 * STRICT ENFORCEMENT: Any resource with a validation error is NEVER added to toAdd.
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
    if (!raw || typeof raw !== 'object') {
      errors.push({ index: idx, field: 'item', message: 'Item must be a valid JSON object.' });
      return;
    }

    const item = raw as Record<string, unknown>;
    const itemErrors: string[] = [];

    // 1. Name validation
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!name) {
      itemErrors.push('Resource name is required.');
    } else if (name.length < 2) {
      itemErrors.push('Resource name must be at least 2 characters.');
    }

    // 2. URL validation (must be valid HTTPS or HTTP URL)
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    if (!url) {
      itemErrors.push('Resource official URL is required.');
    } else {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
          itemErrors.push('URL protocol must be https:// or http://.');
        }
      } catch {
        itemErrors.push('Invalid URL format.');
      }
    }

    // 3. Provider validation
    const provider = typeof item.provider === 'string' ? item.provider.trim() : '';
    if (!provider) {
      itemErrors.push('Provider / Organization name is required.');
    }

    // 4. Description validation
    const description = typeof item.description === 'string' ? item.description.trim() : '';
    if (!description) {
      itemErrors.push('Short description is required.');
    } else if (description.length < 10) {
      itemErrors.push('Description should be at least 10 characters.');
    }

    // 5. Category validation & normalization
    const categoryRaw = typeof item.category === 'string' ? item.category.trim() : '';
    let category: ResourceCategory | null = null;
    if (categoryRaw && RESOURCE_CATEGORIES.includes(categoryRaw as ResourceCategory)) {
      category = categoryRaw as ResourceCategory;
    } else if (categoryRaw) {
      const matched = RESOURCE_CATEGORIES.find((cat) => cat.toLowerCase() === categoryRaw.toLowerCase());
      if (matched) {
        category = matched;
      }
    }
    if (!category) {
      itemErrors.push(
        `Category "${categoryRaw || 'empty'}" is invalid. Must be one of: ${RESOURCE_CATEGORIES.join(', ')}`
      );
    }

    // 6. Difficulty validation
    let difficulty: DifficultyLevel = 'All Levels';
    if (item.difficulty !== undefined) {
      if (VALID_DIFFICULTIES.includes(item.difficulty as DifficultyLevel)) {
        difficulty = item.difficulty as DifficultyLevel;
      } else {
        itemErrors.push(`Invalid difficulty "${String(item.difficulty)}". Must be Beginner, Intermediate, Advanced, or All Levels.`);
      }
    }

    // 7. Free Status validation
    let free_status: FreeStatus = '100% Free';
    if (item.free_status !== undefined) {
      if (VALID_FREE_STATUSES.includes(item.free_status as FreeStatus)) {
        free_status = item.free_status as FreeStatus;
      } else {
        itemErrors.push(`Invalid free_status "${String(item.free_status)}". Allowed: ${VALID_FREE_STATUSES.join(', ')}`);
      }
    }

    // 8. Resource Status validation
    let status: ResourceStatus = 'Active';
    if (item.status !== undefined) {
      if (VALID_STATUSES.includes(item.status as ResourceStatus)) {
        status = item.status as ResourceStatus;
      } else {
        itemErrors.push(`Invalid status "${String(item.status)}". Allowed: ${VALID_STATUSES.join(', ')}`);
      }
    }

    // 9. Dates validation
    let date_added = todayStr;
    if (item.date_added !== undefined) {
      if (typeof item.date_added === 'string' && isValidDateString(item.date_added)) {
        date_added = item.date_added;
      } else {
        itemErrors.push(`Invalid date_added "${String(item.date_added)}". Must be YYYY-MM-DD.`);
      }
    }

    let last_verified = todayStr;
    if (item.last_verified !== undefined) {
      if (typeof item.last_verified === 'string' && isValidDateString(item.last_verified)) {
        last_verified = item.last_verified;
      } else {
        itemErrors.push(`Invalid last_verified "${String(item.last_verified)}". Must be YYYY-MM-DD.`);
      }
    }

    // 10. Tags validation
    let tags: string[] = [];
    if (item.tags !== undefined) {
      if (Array.isArray(item.tags)) {
        tags = item.tags.map((t) => String(t).trim()).filter(Boolean);
      } else {
        itemErrors.push('Tags must be an array of strings.');
      }
    }

    // CRITICAL FIX: If ANY validation error occurred, record all issues and DO NOT PROCEED TO ADD!
    if (itemErrors.length > 0) {
      itemErrors.forEach((msg) => {
        errors.push({ index: idx, name: name || `Item #${idx + 1}`, field: 'validation', message: msg });
      });
      return; // STOP! Never add an invalid resource to toAdd!
    }

    // 11. Duplicate check within the import batch
    const normUrl = normalizeUrl(url);
    const normName = name.toLowerCase();

    if (seenBatchUrls.has(normUrl) || seenBatchNames.has(normName)) {
      duplicates.push({
        resource: {
          id: `batch-dup-${idx}`,
          name,
          url,
          provider,
          description,
          category: category!,
          tags,
          difficulty,
          free_status,
          date_added,
          last_verified,
          status,
        },
        matchedWith: {
          id: 'batch-earlier',
          name,
          url,
          provider,
          description: '',
          category: category!,
          tags: [],
          difficulty,
          free_status,
          date_added,
          last_verified,
          status: 'Active',
        },
        matchReason: seenBatchUrls.has(normUrl) ? 'normalized_url' : 'exact_name',
      });
      return;
    }

    seenBatchUrls.add(normUrl);
    seenBatchNames.add(normName);

    // 12. Duplicate check against existing library
    const dupMatch = findDuplicate({ name, url, provider }, existingResources);
    if (dupMatch) {
      duplicates.push({
        resource: {
          id: `dup-${idx}`,
          name,
          url,
          provider,
          description,
          category: category!,
          tags,
          difficulty,
          free_status,
          date_added,
          last_verified,
          status,
        },
        matchedWith: dupMatch.matchedWith,
        matchReason: dupMatch.matchReason,
      });
      return;
    }

    // Successfully validated and verified unique!
    const validResource: LearningResource = {
      id: `res-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      description,
      url,
      provider,
      category: category!,
      tags,
      difficulty,
      free_status,
      paid_features: typeof item.paid_features === 'string' ? item.paid_features.trim() : undefined,
      date_added,
      last_verified,
      status,
      learning_path: typeof item.learning_path === 'string' ? item.learning_path.trim() : undefined,
      is_featured: Boolean(item.is_featured),
    };

    toAdd.push(validResource);
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
