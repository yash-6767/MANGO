import { Code2, BarChart3, BrainCircuit } from 'lucide-react';
import type { Question, CompanyName } from '../types/user';

export const questionsData: Question[] = [
  { id: 1, title: 'Valid Anagram', topic: 'Arrays & Strings', difficulty: 'Easy', company: 'Google', time: '15 min', status: 'Solved' },
  { id: 2, title: 'LRU Cache', topic: 'Design', difficulty: 'Medium', company: 'Meta', time: '35 min', status: 'Attempted' },
  { id: 3, title: 'Number of Islands', topic: 'Graphs', difficulty: 'Medium', company: 'Google', time: '25 min', status: 'Not started' },
  { id: 4, title: 'Merge K Sorted Lists', topic: 'Heaps', difficulty: 'Hard', company: 'Google', time: '40 min', status: 'Not started' },
  { id: 5, title: 'Design a Rate Limiter', topic: 'Systems', difficulty: 'Medium', company: 'OpenAI', time: '30 min', status: 'Not started' },
  { id: 6, title: 'Word Break', topic: 'Dynamic Programming', difficulty: 'Medium', company: 'Meta', time: '30 min', status: 'Not started' },
  { id: 7, title: 'CUDA Memory Coalescing', topic: 'Performance', difficulty: 'Hard', company: 'NVIDIA', time: '35 min', status: 'Not started' },
  { id: 8, title: 'Real-time Telemetry Pipeline', topic: 'Embedded', difficulty: 'Hard', company: 'SpaceX', time: '45 min', status: 'Not started' },
  { id: 9, title: 'Attention Is All You Need', topic: 'ML Foundations', difficulty: 'Medium', company: 'Anthropic', time: '25 min', status: 'Not started' },
];

export const allCompanies: CompanyName[] = ['Meta', 'Anthropic', 'NVIDIA', 'Google', 'OpenAI', 'SpaceX'];

export interface CompanyDetail {
  name: CompanyName;
  mark: string;
  accent: string;
  tint: string;
  focus: string;
  overview: string;
  rounds: string[];
  topics: string[];
}

export const companiesData: CompanyDetail[] = [
  {
    name: 'Meta',
    mark: '∞',
    accent: 'var(--emerald-primary)',
    tint: 'var(--sage-soft)',
    focus: 'Product engineering & AI',
    overview: 'Build products that connect billions of people and move quickly from idea to impact.',
    rounds: ['Coding fundamentals', 'Product sense', 'Systems design', 'Behavioral'],
    topics: ['Arrays & strings', 'Graph traversal', 'Feed ranking', 'Distributed systems'],
  },
  {
    name: 'Anthropic',
    mark: 'A',
    accent: 'var(--sage-dark)',
    tint: 'var(--bg-muted)',
    focus: 'Safety research & system reliability',
    overview: 'Work on foundational alignment, frontier models, and steerable LLM evaluation suites.',
    rounds: ['Research code review', 'Engineering interview', 'Alignment deep dive', 'Values alignment'],
    topics: ['Attention math', 'Model evaluations', 'Interpretability', 'Safety constraints'],
  },
  {
    name: 'NVIDIA',
    mark: 'N',
    accent: 'var(--emerald-deep)',
    tint: 'var(--sage-soft)',
    focus: 'Accelerated computing & full stack',
    overview: 'Power the modern computing stack from silicon design to enterprise AI infra.',
    rounds: ['C++ & CUDA', 'Parallel systems', 'Architecture design', 'Manager round'],
    topics: ['Memory coalescing', 'Triton kernels', 'PCIe bottlenecks', 'Low-level optimizations'],
  },
  {
    name: 'Google',
    mark: 'G',
    accent: 'var(--emerald-primary)',
    tint: 'var(--bg-secondary)',
    focus: 'Scale, infrastructure & platforms',
    overview: 'Design platforms handling billions of queries per day with unmatched latency standards.',
    rounds: ['Algorithmic interview (x2)', 'System architecture', 'Googleiness & Leadership'],
    topics: ['Distributed storage', 'MapReduce / BigTable', 'Cache topologies', 'Graph algorithms'],
  },
  {
    name: 'OpenAI',
    mark: 'O',
    accent: 'var(--sage-dark)',
    tint: 'var(--bg-secondary)',
    focus: 'Applied AI & infrastructure',
    overview: 'Scale frontier training runs and build fast APIs serving millions of developers.',
    rounds: ['Practical coding challenge', 'Infra architecture', 'Research translation', 'Cultural add'],
    topics: ['Async queues', 'Rate limiters', 'KV cache optimization', 'GPU clusters'],
  },
  {
    name: 'SpaceX',
    mark: 'S',
    accent: 'var(--text-main)',
    tint: 'var(--bg-muted)',
    focus: 'Embedded software & avionics',
    overview: 'Write fault-tolerant avionics flight code and real-time mission telemetry engines.',
    rounds: ['Hardware-in-the-loop coding', 'Concurrency & RTOS', 'Systems integration'],
    topics: ['Telemetry compression', 'Flight loops', 'CAN bus protocol', 'State machines'],
  },
];

export const milestoneGroups = [
  {
    title: 'Software Engineering',
    icon: Code2,
    milestones: ['Programming fundamentals', 'Data structures & algorithms', 'System design essentials', 'Behavioral storytelling'],
  },
  {
    title: 'Data Science',
    icon: BarChart3,
    milestones: ['Statistics & experimentation', 'SQL and data modeling', 'ML foundations', 'Case study practice'],
  },
  {
    title: 'AI / ML Engineering',
    icon: BrainCircuit,
    milestones: ['Math & linear algebra', 'PyTorch & Transformer architectures', 'Distributed training', 'Model alignment & evaluations'],
  },
];

export const CAREER_TARGETS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'Data Scientist',
  'Mobile Developer',
  'Other',
];

export const PROGRAMMING_LANGUAGES = ['Python', 'Java', 'C++', 'TypeScript / JavaScript', 'Go', 'Rust', 'Other'];

export const TARGET_COMPANIES: CompanyName[] = ['Meta', 'Anthropic', 'NVIDIA', 'Google', 'OpenAI', 'SpaceX'];

export const EXPERIENCE_LEVELS = [
  'Beginner / Student',
  'Sophomore / Junior',
  'Senior / New Grad',
  'Master / PhD Student',
  'Career Transitioner',
];
