import { LearningResource } from './resources';

export type CompanyName = 'Meta' | 'Anthropic' | 'NVIDIA' | 'Google' | 'OpenAI' | 'SpaceX';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionStatus = 'Solved' | 'Attempted' | 'Not started';

export interface Question {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  company: CompanyName;
  time: string;
  status: QuestionStatus;
}

export interface UserProfile {
  fullName: string;
  university: string;
  targetRole: string;
  targetCompany: CompanyName;
  preferredLanguage: string;
  experienceLevel: string;
  preferences?: Record<string, unknown>;
}

export interface WorkspaceState {
  solved: number[];
  attempted: number[];
  bookmarks: number[];
  resourceBookmarks: string[];
  customResources: LearningResource[];
  completedMilestones: string[];
  streak: number;
  profile: {
    fullName?: string;
    role?: string;
    targetRole?: string;
    company: CompanyName;
    school?: string;
    university?: string;
    preferredLanguage?: string;
    experienceLevel?: string;
  };
}
