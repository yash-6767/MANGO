export type ResourceCategory =
  | 'Data Structures & Algorithms'
  | 'Programming Languages'
  | 'Computer Science Fundamentals'
  | 'Web Development'
  | 'Frontend Development'
  | 'Backend Development'
  | 'Full Stack Development'
  | 'Artificial Intelligence & Machine Learning'
  | 'Data Science'
  | 'System Design'
  | 'Git & Open Source'
  | 'Interview Preparation'
  | 'Resume & Career Development';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export type FreeStatus = '100% Free' | 'Free Course' | 'Free with Optional Certificate' | 'Free Tier Available' | 'Free';

export type ResourceStatus = 'Active' | 'Under Review' | 'Broken' | 'Archived';

export interface LearningResource {
  id: string;
  name: string;
  description: string;
  url: string;
  provider: string;
  category: ResourceCategory;
  tags: string[];
  difficulty: DifficultyLevel;
  free_status: FreeStatus;
  paid_features?: string;
  date_added: string; // YYYY-MM-DD
  last_verified: string; // YYYY-MM-DD
  status: ResourceStatus;
  learning_path?: string;
  is_featured?: boolean;
}

export interface ResourceImportPayload {
  resources: Array<{
    name: string;
    description: string;
    url: string;
    provider: string;
    category: string;
    tags?: string[];
    difficulty?: string;
    free_status?: string;
    paid_features?: string;
    date_added?: string;
    last_verified?: string;
    status?: string;
    learning_path?: string;
    is_featured?: boolean;
  }>;
}

export interface ValidationIssue {
  index: number;
  name?: string;
  field: string;
  message: string;
}

export interface DuplicateDetectionResult {
  resource: LearningResource;
  matchedWith: LearningResource;
  matchReason: 'exact_url' | 'normalized_url' | 'name_and_provider' | 'exact_name';
}

export interface ImportPreviewResult {
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  toAdd: LearningResource[];
  duplicates: DuplicateDetectionResult[];
  errors: ValidationIssue[];
}
