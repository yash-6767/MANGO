import { useEffect, useState, useMemo } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Download,
  FileSearch,
  Filter,
  Flame,
  Gauge,
  Lightbulb,
  Menu,
  MessageSquareText,
  Moon,
  Play,
  Plus,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import type { Page } from './components/Sidebar';
import { LearningResourcesView } from './components/LearningResources/LearningResourcesView';
import { ResourceCard } from './components/LearningResources/ResourceCard';
import { INITIAL_RESOURCES } from './data/initialResources';
import type { LearningResource } from './types/resources';

type CompanyName = 'Meta' | 'Anthropic' | 'NVIDIA' | 'Google' | 'OpenAI' | 'SpaceX';
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type QuestionStatus = 'Solved' | 'Attempted' | 'Not started';
type Question = {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  company: CompanyName;
  time: string;
  status: QuestionStatus;
};

type State = {
  solved: number[];
  attempted: number[];
  bookmarks: number[];
  resourceBookmarks: string[];
  customResources: LearningResource[];
  completedMilestones: string[];
  streak: number;
  profile: { role: string; company: CompanyName; school: string };
};

const companies: {
  name: CompanyName;
  mark: string;
  accent: string;
  tint: string;
  focus: string;
  overview: string;
  rounds: string[];
  topics: string[];
}[] = [
  {
    name: 'Meta',
    mark: '∞',
    accent: '#176B50',
    tint: '#DCE6D8',
    focus: 'Product engineering & AI',
    overview: 'Build products that connect billions of people and move quickly from idea to impact.',
    rounds: ['Coding fundamentals', 'Product sense', 'Systems design', 'Behavioral'],
    topics: ['Arrays & strings', 'Graph traversal', 'Feed ranking', 'Distributed systems'],
  },
  {
    name: 'Anthropic',
    mark: 'A',
    accent: '#5F7563',
    tint: '#E6DDC8',
    focus: 'AI safety & research',
    overview: 'Work on reliable, interpretable AI with a deep focus on evaluation and thoughtful reasoning.',
    rounds: ['Coding & reasoning', 'Research discussion', 'ML systems', 'Values & collaboration'],
    topics: ['Python fluency', 'Evals design', 'Transformer basics', 'Research taste'],
  },
  {
    name: 'NVIDIA',
    mark: '◒',
    accent: '#176B50',
    tint: '#DCE6D8',
    focus: 'GPU systems & performance',
    overview: 'Shape accelerated computing through hardware-aware software, compilers, and systems.',
    rounds: ['Coding fundamentals', 'Systems deep dive', 'Performance', 'Behavioral'],
    topics: ['C++', 'CUDA concepts', 'Memory hierarchy', 'Parallel algorithms'],
  },
  {
    name: 'Google',
    mark: 'G',
    accent: '#176B50',
    tint: '#FAF8F2',
    focus: 'Systems & applied research',
    overview: 'Solve ambitious problems at global scale with clarity, rigor, and strong engineering habits.',
    rounds: ['Coding', 'Googleyness', 'Systems design', 'Role-related'],
    topics: ['Data structures', 'Algorithms', 'Scalability', 'Communication'],
  },
  {
    name: 'OpenAI',
    mark: '✳',
    accent: '#104C3A',
    tint: '#E6DDC8',
    focus: 'Frontier AI & products',
    overview: 'Turn frontier intelligence into useful products while staying close to the hard technical work.',
    rounds: ['Coding', 'ML foundations', 'Product thinking', 'Mission fit'],
    topics: ['Python', 'Inference', 'Model evaluation', 'API design'],
  },
  {
    name: 'SpaceX',
    mark: 'X',
    accent: '#5F7563',
    tint: '#FAF8F2',
    focus: 'Aerospace & embedded software',
    overview: 'Make life multiplanetary with software that operates under real constraints and high stakes.',
    rounds: ['Coding', 'Embedded systems', 'Technical deep dive', 'Mission fit'],
    topics: ['C/C++', 'Real-time systems', 'Networking', 'Debugging'],
  },
];

const questions: Question[] = [
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

const milestoneGroups = [
  {
    title: 'Software Engineering',
    icon: Code2,
    color: '#176B50',
    milestones: ['Programming fundamentals', 'Data structures & algorithms', 'System design essentials', 'Behavioral storytelling'],
  },
  {
    title: 'Data Science',
    icon: BarChart3,
    color: '#5F7563',
    milestones: ['Statistics & experimentation', 'SQL and data modeling', 'ML foundations', 'Case study practice'],
  },
  {
    title: 'AI / ML Engineering',
    icon: BrainCircuit,
    color: '#176B50',
    milestones: ['Python & linear algebra', 'Model training loops', 'Evaluation & safety', 'Production inference'],
  },
  {
    title: 'Backend Development',
    icon: LayersIcon,
    color: '#5F7563',
    milestones: ['API design', 'Databases & caching', 'Distributed systems', 'Reliability & observability'],
  },
];

function LayersIcon(props: { className?: string }) {
  return (
    <span className={props.className}>
      <span className="block h-2 w-5 rounded-sm border border-current" />
      <span className="mt-1 block h-2 w-5 rounded-sm border border-current" />
      <span className="mt-1 block h-2 w-5 rounded-sm border border-current" />
    </span>
  );
}

const defaultState: State = {
  solved: [1],
  attempted: [2],
  bookmarks: [2, 5],
  resourceBookmarks: ['res-freecodecamp', 'res-cs50', 'res-system-design-primer'],
  customResources: INITIAL_RESOURCES,
  completedMilestones: ['Programming fundamentals'],
  streak: 12,
  profile: { role: 'Software Engineering', company: 'Meta', school: 'University of Michigan' },
};

const learnerKey = 'demo-learner';

function App() {
  const [page, setPage] = useState<Page>('Dashboard');
  const [state, setState] = useState<State>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load state from localStorage / Supabase
  useEffect(() => {
    const loadState = async () => {
      const local = localStorage.getItem('mangos-workspace-state');
      let loadedState = defaultState;
      if (local) {
        try {
          const parsed = JSON.parse(local) as Partial<State>;
          loadedState = {
            ...defaultState,
            ...parsed,
            customResources: parsed.customResources && parsed.customResources.length > 0 ? parsed.customResources : INITIAL_RESOURCES,
            resourceBookmarks: parsed.resourceBookmarks || defaultState.resourceBookmarks,
          };
          setState(loadedState);
        } catch {
          setState(defaultState);
        }
      }

      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from('mangos_workspace_state')
            .select('state')
            .eq('learner_key', learnerKey)
            .maybeSingle();

          if (data?.state) {
            const dbState = data.state as Partial<State>;
            setState((prev) => ({
              ...prev,
              ...dbState,
              customResources: dbState.customResources && dbState.customResources.length > 0 ? dbState.customResources : prev.customResources,
              resourceBookmarks: dbState.resourceBookmarks || prev.resourceBookmarks,
            }));
          }
        } catch {
          // Gracefully fallback to local storage
        }
      }
      setHydrated(true);
    };
    void loadState();
  }, []);

  // Sync state to localStorage & Supabase
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('mangos-workspace-state', JSON.stringify(state));

    if (isSupabaseConfigured) {
      const timer = window.setTimeout(async () => {
        try {
          await supabase
            .from('mangos_workspace_state')
            .upsert(
              { learner_key: learnerKey, state, updated_at: new Date().toISOString() },
              { onConflict: 'learner_key' }
            );
        } catch {
          // ignore network or offline issues
        }
      }, 500);
      return () => window.clearTimeout(timer);
    }
  }, [state, hydrated]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    notify('Theme updated');
  };

  const navigate = (next: Page) => {
    setPage(next);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleQuestionBookmark = (id: number) => {
    setState((current) => ({
      ...current,
      bookmarks: current.bookmarks.includes(id)
        ? current.bookmarks.filter((item) => item !== id)
        : [...current.bookmarks, id],
    }));
  };

  const toggleResourceBookmark = (id: string) => {
    setState((current) => {
      const isBookmarked = current.resourceBookmarks.includes(id);
      const nextBookmarks = isBookmarked
        ? current.resourceBookmarks.filter((item) => item !== id)
        : [...current.resourceBookmarks, id];
      notify(isBookmarked ? 'Resource removed from bookmarks' : 'Resource saved to bookmarks');
      return {
        ...current,
        resourceBookmarks: nextBookmarks,
      };
    });
  };

  const setCustomResources = (updater: SetStateAction<LearningResource[]>) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current.customResources) : updater;
      return { ...current, customResources: next };
    });
  };

  const updateQuestion = (id: number, status: QuestionStatus) => {
    setState((current) => ({
      ...current,
      solved: status === 'Solved' ? [...new Set([...current.solved, id])] : current.solved.filter((item) => item !== id),
      attempted: status === 'Attempted' ? [...new Set([...current.attempted, id])] : current.attempted.filter((item) => item !== id),
    }));
  };

  const toggleMilestone = (milestone: string) => {
    setState((current) => ({
      ...current,
      completedMilestones: current.completedMilestones.includes(milestone)
        ? current.completedMilestones.filter((item) => item !== milestone)
        : [...current.completedMilestones, milestone],
    }));
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-[#F4F0E6] text-[#24332B] flex">
      {/* 1. Full-Height, Independently Scrollable Sidebar */}
      <Sidebar
        page={page}
        navigate={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        resourceBookmarkCount={state.resourceBookmarks.length}
        questionBookmarkCount={state.bookmarks.length}
      />

      {/* 2. Main Content Area (Scrolls Independently from Sidebar) */}
      <div className="flex-1 min-w-0 lg:pl-[260px] flex flex-col min-h-screen">
        <Topbar page={page} onMenu={() => setMobileOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-8 lg:px-10 lg:pt-8">
          {page === 'Dashboard' && <Dashboard state={state} navigate={navigate} notify={notify} />}
          {page === 'DSA Practice' && (
            <DSA state={state} toggleBookmark={toggleQuestionBookmark} updateQuestion={updateQuestion} notify={notify} />
          )}
          {page === 'Learning Resources' && (
            <LearningResourcesView
              resources={state.customResources}
              setResources={setCustomResources}
              bookmarkedIds={state.resourceBookmarks}
              toggleBookmark={toggleResourceBookmark}
              notify={notify}
            />
          )}
          {page === 'Companies' && <Companies navigate={navigate} notify={notify} />}
          {page === 'Roadmaps' && <Roadmaps state={state} toggleMilestone={toggleMilestone} />}
          {page === 'Mock Interview' && <MockInterview notify={notify} />}
          {page === 'Skill Gap' && <SkillGap navigate={navigate} />}
          {page === 'Resume Analyzer' && <ResumeAnalyzer notify={notify} />}
          {page === 'Bookmarks' && (
            <Bookmarks
              state={state}
              toggleQuestionBookmark={toggleQuestionBookmark}
              toggleResourceBookmark={toggleResourceBookmark}
              updateQuestion={updateQuestion}
              navigate={navigate}
            />
          )}
          {page === 'Profile' && <Profile state={state} setState={setState} />}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-[#A8B5A0] bg-[#104C3A] px-5 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#DCE6D8]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

function Topbar({
  page,
  onMenu,
  theme,
  onToggleTheme,
}: {
  page: Page;
  onMenu: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[70px] shrink-0 items-center justify-between border-b border-[#DDDCCF] bg-[#F4F0E6]/95 px-4 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl border border-[#DDDCCF] bg-white p-2 text-[#5F7563] shadow-sm lg:hidden hover:bg-[#FAF8F2]"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#5F7563]">Student Workspace</p>
          <h1 className="font-display mt-0.5 text-lg font-extrabold tracking-tight text-[#24332B]">{page}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme mode"
          title="Toggle nature-inspired theme mode"
          className="rounded-xl border border-[#DDDCCF] bg-white p-2.5 text-[#5F7563] transition hover:border-[#A8B5A0] hover:text-[#176B50] shadow-sm"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="relative rounded-xl border border-[#DDDCCF] bg-white p-2.5 text-[#5F7563] transition hover:border-[#A8B5A0] hover:text-[#176B50] shadow-sm">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#176B50]" />
        </button>
        <div className="hidden h-7 w-px bg-[#DDDCCF] sm:block mx-1" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176B50] text-xs font-black text-white shadow-sm">
          JD
        </div>
      </div>
    </header>
  );
}

function PageHeader({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#176B50]">{eyebrow}</p>
        <h2 className="font-display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#24332B] sm:text-[36px]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68766C]">{detail}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  color = '#176B50',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DDDCCF] bg-white p-4 shadow-sm hover:border-[#A8B5A0] transition-colors">
      <div className="flex items-center justify-between">
        <span className="rounded-xl p-2.5 bg-[#DCE6D8] text-[#176B50]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766C]">{label}</span>
      </div>
      <p className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[#24332B]">{value}</p>
      <p className="mt-1 text-xs text-[#68766C]">{detail}</p>
    </div>
  );
}

function Dashboard({
  state,
  navigate,
  notify,
}: {
  state: State;
  navigate: (page: Page) => void;
  notify: (message: string) => void;
}) {
  const completion = Math.min(100, Math.round((state.completedMilestones.length / 4) * 100));
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 rounded-3xl border border-[#DDDCCF] bg-gradient-to-br from-[#FAF8F2] via-[#F4F0E6] to-[#E6DDC8] p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#A8B5A0]/60 bg-[#DCE6D8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#176B50]">
            <Sparkles className="h-3.5 w-3.5" /> Career Roadmap Active
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-[-.045em] text-[#24332B] sm:text-4xl">
            Good morning, Jordan.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#68766C]">
            You’re building the right habits. A focused 45 minutes today keeps your path to Meta moving forward.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('DSA Practice')}
              className="rounded-xl bg-[#176B50] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#104C3A] shadow-sm"
            >
              Start today’s session <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('Learning Resources')}
              className="rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-sm font-bold text-[#24332B] transition hover:bg-[#FAF8F2] shadow-sm"
            >
              Browse Curated Resources <BookOpen className="ml-2 inline h-4 w-4 text-[#176B50]" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-5 lg:mr-8 lg:mt-0">
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full shadow-inner"
            style={{
              background: `conic-gradient(#176B50 ${completion * 3.6}deg, #DDDCCF 0deg)`,
            }}
          >
            <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-white shadow-sm">
              <span className="font-display text-2xl font-extrabold text-[#24332B]">{completion}%</span>
              <span className="text-[10px] text-[#68766C]">overall</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#68766C]">YOUR PREP</p>
            <p className="mt-1 text-lg font-extrabold text-[#24332B]">On track</p>
            <p className="mt-1 text-xs text-[#5F7563]">Target: Software Engineer</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flame} label="Current streak" value={`${state.streak} days`} detail="Best: 18 days" />
        <StatCard icon={Code2} label="Problems solved" value={`${state.solved.length} / 120`} detail="+3 this week" />
        <StatCard icon={Clock3} label="Study time" value="4h 20m" detail="This week · 72% of goal" />
        <StatCard
          icon={BookOpen}
          label="Learning Resources"
          value={`${state.customResources.length}`}
          detail={`${state.resourceBookmarks.length} saved bookmarks`}
        />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#24332B]">Weekly activity</h3>
              <p className="mt-1 text-xs text-[#68766C]">Your study rhythm over the last 7 days</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#176B50]">
              This week <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-7 flex h-40 items-end justify-between gap-2 border-b border-[#DDDCCF] pb-0">
            {[34, 58, 42, 76, 63, 92, 48].map((height, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={`w-full max-w-[34px] rounded-t-lg transition hover:opacity-80 ${
                    index === 5 ? 'bg-[#176B50]' : 'bg-[#DCE6D8]'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="mb-[-22px] text-[10px] font-bold text-[#68766C]">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between text-xs text-[#68766C]">
            <span>0h</span>
            <span>1h</span>
            <span>2h</span>
            <span>3h</span>
            <span>4h+</span>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#24332B]">Today’s goals</h3>
              <p className="mt-1 text-xs text-[#68766C]">Keep the streak alive</p>
            </div>
            <span className="text-sm font-bold text-[#176B50]">2 / 3</span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ['Solve 2 array problems', true],
              ['Review system design notes', true],
              ['Read System Design Primer chapter', false],
            ].map(([label, done]) => (
              <button
                key={String(label)}
                onClick={() => notify(done ? 'Goal already complete' : 'Goal marked in your daily focus')}
                className="flex w-full items-center gap-3 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-3 text-left transition hover:border-[#A8B5A0]"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    done ? 'border-[#176B50] bg-[#176B50] text-white' : 'border-[#A8B5A0] bg-white'
                  }`}
                >
                  {done && <Check className="h-3 w-3" />}
                </span>
                <span className={`text-sm font-semibold ${done ? 'text-[#68766C] line-through' : 'text-[#24332B]'}`}>
                  {String(label)}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => navigate('Roadmaps')} className="mt-5 text-xs font-bold text-[#176B50] flex items-center gap-1">
            View my roadmap <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#176B50]">Continue learning</p>
              <h3 className="font-display mt-2 text-xl font-extrabold text-[#24332B]">System design essentials</h3>
            </div>
            <span className="rounded-lg bg-[#DCE6D8] px-2.5 py-1.5 text-[10px] font-bold text-[#176B50]">
              IN PROGRESS
            </span>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#68766C]">
            Design a rate limiter, explore trade-offs, and get comfortable explaining your decisions out loud.
          </p>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2 flex-1 rounded-full bg-[#FAF8F2] border border-[#DDDCCF]">
              <div className="h-full w-[64%] rounded-full bg-[#176B50]" />
            </div>
            <span className="text-xs font-bold text-[#176B50]">64%</span>
          </div>
          <button
            onClick={() => navigate('DSA Practice')}
            className="mt-6 rounded-xl bg-[#176B50] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#104C3A] shadow-sm flex items-center gap-1.5"
          >
            Resume lesson <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        </section>

        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#DCE6D8] p-2.5 text-[#176B50]">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#176B50]">Recommended next</p>
              <h3 className="mt-1 text-base font-extrabold text-[#24332B]">Curated Learning Library</h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#68766C]">
            Explore 10+ verified free learning resources, CS50, freeCodeCamp, NeetCode, and full-stack roadmaps.
          </p>
          <button
            onClick={() => navigate('Learning Resources')}
            className="mt-5 text-xs font-bold text-[#176B50] flex items-center gap-1"
          >
            Explore Library <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
}

function DSA({
  state,
  toggleBookmark,
  updateQuestion,
  notify,
}: {
  state: State;
  toggleBookmark: (id: number) => void;
  updateQuestion: (id: number, status: QuestionStatus) => void;
  notify: (message: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All topics');
  const [difficulty, setDifficulty] = useState('All difficulty');
  const [company, setCompany] = useState('All companies');
  const [selected, setSelected] = useState<Question | null>(null);

  const topics = ['All topics', ...new Set(questions.map((question) => question.topic))];
  const filtered = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(search.toLowerCase()) &&
      (topic === 'All topics' || question.topic === topic) &&
      (difficulty === 'All difficulty' || question.difficulty === difficulty) &&
      (company === 'All companies' || question.company === company)
  );

  return (
    <div>
      <PageHeader
        eyebrow="Practice hub"
        title="Build the muscle."
        detail="A focused set of problems, tagged for the companies and roles you’re preparing for."
        action={
          <button
            onClick={() => notify('Daily practice plan refreshed')}
            className="rounded-xl bg-[#176B50] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#104C3A]"
          >
            Daily challenge <Zap className="ml-1 inline h-4 w-4" />
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Code2} label="Solved" value={`${state.solved.length}`} detail="of 120 questions" />
        <StatCard icon={Bookmark} label="Bookmarked" value={`${state.bookmarks.length}`} detail="Ready to revisit" />
        <StatCard icon={Gauge} label="This week" value="3 / 5" detail="practice goal" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_300px]">
        <section className="min-w-0 rounded-2xl border border-[#DDDCCF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#68766C]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search questions..."
                className="w-full rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] py-2.5 pl-10 pr-3 text-sm text-[#24332B] outline-none placeholder:text-[#68766C] focus:border-[#176B50] focus:bg-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-xl border border-[#DDDCCF] bg-white py-2.5 px-3 text-xs font-bold text-[#24332B] outline-none focus:border-[#176B50]"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-xl border border-[#DDDCCF] bg-white py-2.5 px-3 text-xs font-bold text-[#24332B] outline-none focus:border-[#176B50]"
              >
                <option>All difficulty</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-xl border border-[#DDDCCF] bg-white py-2.5 px-3 text-xs font-bold text-[#24332B] outline-none focus:border-[#176B50]"
              >
                <option>All companies</option>
                {companies.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-b border-[#DDDCCF] pb-3 text-xs text-[#68766C]">
            <span>{filtered.length} questions</span>
            <span>Sorted by recommended</span>
          </div>

          <div className="divide-y divide-[#DDDCCF]">
            {filtered.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                isBookmarked={state.bookmarks.includes(question.id)}
                onBookmark={() => toggleBookmark(question.id)}
                onOpen={() => setSelected(question)}
                onStatus={(status) => updateQuestion(question.id, status)}
                state={state}
              />
            ))}
            {filtered.length === 0 && (
              <EmptyState icon={Search} title="No questions found" detail="Try a different topic, company, or search term." />
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-[#DDDCCF] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#176B50]">Topic progress</p>
          <h3 className="font-display mt-2 text-lg font-extrabold text-[#24332B]">Your coverage</h3>
          <div className="mt-6 space-y-4">
            {['Arrays & Strings', 'Graphs', 'Design', 'Dynamic Programming', 'Systems'].map((item, index) => (
              <div key={item}>
                <div className="mb-2 flex justify-between text-xs font-semibold">
                  <span className="text-[#24332B]">{item}</span>
                  <span className="text-[#68766C]">{[82, 34, 28, 12, 46][index]}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#FAF8F2] border border-[#DDDCCF]">
                  <div className="h-full rounded-full bg-[#176B50]" style={{ width: `${[82, 34, 28, 12, 46][index]}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[#176B50]">
              <ShieldCheck className="h-4 w-4" /> Interview note
            </p>
            <p className="mt-2 text-xs leading-5 text-[#68766C]">
              Questions are practice material, not guaranteed interview questions.
            </p>
          </div>
        </aside>
      </div>

      {selected && (
        <QuestionModal
          question={selected}
          onClose={() => setSelected(null)}
          isBookmarked={state.bookmarks.includes(selected.id)}
          onBookmark={() => toggleBookmark(selected.id)}
          notify={notify}
        />
      )}
    </div>
  );
}

function QuestionRow({
  question,
  isBookmarked,
  onBookmark,
  onOpen,
  onStatus,
  state,
}: {
  question: Question;
  isBookmarked: boolean;
  onBookmark: () => void;
  onOpen: () => void;
  onStatus: (status: QuestionStatus) => void;
  state: State;
}) {
  const status = state.solved.includes(question.id) ? 'Solved' : state.attempted.includes(question.id) ? 'Attempted' : 'Not started';
  return (
    <div className="group flex items-center gap-3 py-4">
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
              status === 'Solved'
                ? 'border-[#176B50] bg-[#DCE6D8] text-[#176B50]'
                : status === 'Attempted'
                ? 'border-[#A8B5A0] bg-[#FAF8F2] text-[#5F7563]'
                : 'border-[#DDDCCF] bg-[#FAF8F2] text-[#68766C]'
            }`}
          >
            {status === 'Solved' ? <Check className="h-3.5 w-3.5" /> : status === 'Attempted' ? <Clock3 className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[#24332B] transition group-hover:text-[#176B50]">
              {question.title}
            </span>
            <span className="mt-1 block text-xs text-[#68766C]">
              {question.topic} · {question.company}
            </span>
          </span>
        </div>
      </button>

      <span
        className={`hidden rounded-md px-2 py-1 text-[10px] font-bold sm:block ${
          question.difficulty === 'Easy'
            ? 'bg-[#DCE6D8] text-[#176B50]'
            : question.difficulty === 'Medium'
            ? 'bg-[#FAF8F2] text-[#5F7563] border border-[#DDDCCF]'
            : 'bg-[#E6DDC8] text-[#104C3A]'
        }`}
      >
        {question.difficulty}
      </span>
      <span className="hidden text-xs text-[#68766C] md:block">{question.time}</span>
      <select
        value={status}
        onChange={(event) => onStatus(event.target.value as QuestionStatus)}
        className="hidden rounded-lg border border-[#DDDCCF] bg-white px-2 py-1.5 text-[10px] font-bold text-[#5F7563] outline-none sm:block"
      >
        <option>Solved</option>
        <option>Attempted</option>
        <option>Not started</option>
      </select>
      <button
        onClick={onBookmark}
        className={`rounded-lg p-2 transition ${isBookmarked ? 'text-[#176B50]' : 'text-[#68766C] hover:text-[#24332B]'}`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}

function QuestionModal({
  question,
  onClose,
  isBookmarked,
  onBookmark,
  notify,
}: {
  question: Question;
  onClose: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  notify: (message: string) => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded-md bg-[#DCE6D8] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#176B50]">
            {question.difficulty} · {question.time}
          </span>
          <h2 className="font-display mt-4 text-2xl font-extrabold text-[#24332B]">{question.title}</h2>
          <p className="mt-2 text-sm text-[#68766C]">
            {question.topic} · Practice signal for {question.company}
          </p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-[#68766C] hover:bg-[#FAF8F2] hover:text-[#24332B]">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-7 rounded-2xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#5F7563]">Prompt</p>
        <p className="mt-3 text-sm leading-6 text-[#24332B]">
          Explain a clean approach to this problem. Start with constraints, share your complexity trade-offs, and name the edge cases you would test.
        </p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => notify('Hint unlocked: start with the simplest constraint')}
          className="rounded-xl border border-[#DDDCCF] px-4 py-2.5 text-xs font-bold text-[#24332B] hover:border-[#176B50]"
        >
          <Lightbulb className="mr-1.5 inline h-3.5 w-3.5 text-[#176B50]" /> Show hint
        </button>
        <button
          onClick={() => {
            onBookmark();
            notify(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
          }}
          className="rounded-xl border border-[#DDDCCF] px-4 py-2.5 text-xs font-bold text-[#24332B] hover:border-[#176B50]"
        >
          <Bookmark className={`mr-1.5 inline h-3.5 w-3.5 ${isBookmarked ? 'fill-current text-[#176B50]' : ''}`} />
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>
      <button
        onClick={() => notify('Practice session started')}
        className="mt-7 w-full rounded-xl bg-[#176B50] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#104C3A]"
      >
        Start problem <ArrowRight className="ml-1 inline h-4 w-4" />
      </button>
    </Modal>
  );
}

function Companies({ navigate, notify }: { navigate: (page: Page) => void; notify: (message: string) => void }) {
  const [selected, setSelected] = useState(companies[0]);
  return (
    <div>
      <PageHeader
        eyebrow="Company preparation"
        title="Prepare with context."
        detail="Six focused hubs for the exact companies MANGOS is built around. Explore the signal, then practice the role."
      />
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {companies.map((company) => (
            <button
              key={company.name}
              onClick={() => setSelected(company)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition shadow-sm ${
                selected.name === company.name
                  ? 'border-[#176B50] bg-[#DCE6D8]/60 font-bold'
                  : 'border-[#DDDCCF] bg-white hover:border-[#A8B5A0]'
              }`}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold"
                style={{ background: company.tint, color: company.accent }}
              >
                {company.mark}
              </span>
              <span>
                <span className="block text-sm font-bold text-[#24332B]">{company.name}</span>
                <span className="block text-[10px] text-[#68766C]">{company.focus}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 text-[#68766C]" />
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <div className="flex items-center gap-4">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold shadow-sm"
                  style={{ background: selected.tint, color: selected.accent }}
                >
                  {selected.mark}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#176B50]">{selected.focus}</p>
                  <h2 className="font-display mt-1 text-3xl font-extrabold text-[#24332B]">{selected.name}</h2>
                </div>
              </div>
              <p className="mt-6 max-w-xl text-sm leading-6 text-[#68766C]">{selected.overview}</p>
            </div>
            <button
              onClick={() => notify(`${selected.name} hub added to your focus`)}
              className="h-fit rounded-xl border border-[#DDDCCF] bg-white px-3 py-2 text-xs font-bold text-[#24332B] hover:border-[#176B50]"
            >
              Add to focus <Plus className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F7563]">Interview rounds</p>
              <div className="mt-4 space-y-3">
                {selected.rounds.map((round, index) => (
                  <div key={round} className="flex items-center gap-3 text-sm font-semibold text-[#24332B]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#DDDCCF] text-[10px] text-[#5F7563]">
                      0{index + 1}
                    </span>
                    {round}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F7563]">Prepare for this signal</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-lg bg-white border border-[#DDDCCF] px-2.5 py-1.5 text-xs font-semibold text-[#24332B]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-[#FAF8F2] p-3 text-xs leading-5 text-[#5F7563] border border-[#DDDCCF]">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[#176B50]" /> Official and community resources are labeled.
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('DSA Practice')}
              className="rounded-xl bg-[#176B50] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#104C3A]"
            >
              Practice coding <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('Mock Interview')}
              className="rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-sm font-bold text-[#24332B] hover:border-[#176B50]"
            >
              Prepare for a round <MessageSquareText className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Roadmaps({
  state,
  toggleMilestone,
}: {
  state: State;
  toggleMilestone: (milestone: string) => void;
}) {
  const [active, setActive] = useState(0);
  const roadmap = milestoneGroups[active];
  const complete = roadmap.milestones.filter((item) => state.completedMilestones.includes(item)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Career roadmaps"
        title="Make progress visible."
        detail="Choose a path, follow the milestones, and build evidence that you’re ready for the next step."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-[#DDDCCF] bg-white px-3 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#176B50]" />
            <span className="text-xs font-bold text-[#24332B]">{state.completedMilestones.length} milestones complete</span>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {milestoneGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <button
                key={group.title}
                onClick={() => setActive(index)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition shadow-sm ${
                  active === index
                    ? 'border-[#176B50] bg-[#DCE6D8]/60 font-bold'
                    : 'border-[#DDDCCF] bg-white hover:border-[#A8B5A0]'
                }`}
              >
                <span className="rounded-xl p-2.5 bg-[#FAF8F2] text-[#176B50]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-[#24332B]">{group.title}</span>
              </button>
            );
          })}
        </div>

        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#176B50]">Active roadmap</p>
              <h2 className="font-display mt-2 text-2xl font-extrabold text-[#24332B]">{roadmap.title}</h2>
              <p className="mt-2 text-sm text-[#68766C]">
                Milestone {complete + 1} of {roadmap.milestones.length} · Keep moving at your pace.
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#DDDCCF] text-sm font-extrabold text-[#24332B]"
              style={{ borderTopColor: '#176B50' }}
            >
              {Math.round((complete / roadmap.milestones.length) * 100)}%
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {roadmap.milestones.map((milestone, index) => {
              const done = state.completedMilestones.includes(milestone);
              return (
                <button
                  key={milestone}
                  onClick={() => toggleMilestone(milestone)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    done
                      ? 'border-[#176B50] bg-[#DCE6D8]/40'
                      : 'border-[#DDDCCF] bg-[#FAF8F2] hover:border-[#A8B5A0]'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                      done
                        ? 'border-[#176B50] bg-[#176B50] text-white'
                        : 'border-[#DDDCCF] bg-white text-[#5F7563]'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : `0${index + 1}`}
                  </span>
                  <span className="flex-1">
                    <span className={`block text-sm font-bold ${done ? 'text-[#176B50]' : 'text-[#24332B]'}`}>
                      {milestone}
                    </span>
                    <span className="mt-1 block text-xs text-[#68766C]">
                      {done ? 'Completed' : index === 0 ? 'Core lessons, practice, and a short check-in' : 'Resources, tasks, and role-specific practice'}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#68766C] transition ${done ? '-rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-7 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[#176B50]">
              <BookOpen className="h-4 w-4" /> Suggested resources
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white border border-[#DDDCCF] px-3 py-2 text-xs font-semibold text-[#24332B]">
                MANGOS core notes
              </span>
              <span className="rounded-lg bg-white border border-[#DDDCCF] px-3 py-2 text-xs font-semibold text-[#24332B]">
                Curated Learning Library
              </span>
              <span className="rounded-lg bg-white border border-[#DDDCCF] px-3 py-2 text-xs font-semibold text-[#24332B]">
                Peer checklist
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MockInterview({ notify }: { notify: (message: string) => void }) {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [company, setCompany] = useState<CompanyName>('Meta');
  const [role, setRole] = useState('Software Engineering');

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Interview report"
          title="Strong first round."
          detail="Here’s a directional review to help you focus your next practice session."
          action={
            <button
              onClick={() => {
                setSubmitted(false);
                setStarted(false);
                setAnswer('');
              }}
              className="rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-sm font-bold text-[#24332B]"
            >
              Try another
            </button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Gauge} label="Overall score" value="78 / 100" detail="Above your last attempt" />
          <StatCard icon={MessageSquareText} label="Communication" value="82" detail="Clear and structured" />
          <StatCard icon={Target} label="Next focus" value="Edge cases" detail="Add more specificity" />
        </div>
        <section className="mt-5 rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-extrabold text-[#24332B]">Coach feedback</h3>
          <div className="mt-5 space-y-3">
            {[
              'You started by clarifying the goal, which created a strong frame.',
              'Your trade-off discussion was clear and connected to the user experience.',
              'Next time, name two edge cases before committing to the implementation.',
            ].map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4 text-sm leading-6 text-[#24332B]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DCE6D8] text-xs font-bold text-[#176B50]">
                  0{index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (started) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#176B50]">
              Live mock · {company}
            </p>
            <h2 className="font-display mt-2 text-2xl font-extrabold text-[#24332B]">Product thinking round</h2>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold text-[#5F7563]">
            <Clock3 className="h-4 w-4" /> 18:42
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#FAF8F2] border border-[#DDDCCF]">
          <div className="h-full w-[45%] rounded-full bg-[#176B50]" />
        </div>
        <section className="mt-7 rounded-2xl border border-[#DDDCCF] bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#5F7563]">
            Question 1 of 3 · {role}
          </p>
          <h3 className="font-display mt-5 text-2xl font-extrabold leading-tight text-[#24332B]">
            How would you improve a social feed for college students?
          </h3>
          <p className="mt-4 text-sm leading-6 text-[#68766C]">
            Take 1–2 minutes to structure your answer. Focus on user problem, constraints, metrics, and tradeoffs.
          </p>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write your answer or use this space as your thinking pad..."
            className="mt-7 min-h-44 w-full resize-none rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4 text-sm leading-6 text-[#24332B] outline-none placeholder:text-[#68766C] focus:border-[#176B50] focus:bg-white"
          />
          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              onClick={() => notify('Hint: start with the target user and a measurable outcome')}
              className="rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-xs font-bold text-[#24332B]"
            >
              <Lightbulb className="mr-1 inline h-3.5 w-3.5 text-[#176B50]" /> Get a hint
            </button>
            <button
              onClick={() => setSubmitted(true)}
              disabled={!answer.trim()}
              className="rounded-xl bg-[#176B50] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#104C3A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit answer <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="AI mock interview"
        title="Practice the real conversation."
        detail="Choose your target, then work through one question at a time with feedback and a final report."
      />
      <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company">
            <select
              value={company}
              onChange={(event) => setCompany(event.target.value as CompanyName)}
              className="field"
            >
              <option>Meta</option>
              {companies.slice(1).map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Role">
            <select value={role} onChange={(event) => setRole(event.target.value)} className="field">
              <option>Software Engineering</option>
              <option>AI / ML Engineering</option>
              <option>Research Engineering</option>
              <option>Backend Development</option>
            </select>
          </Field>
          <Field label="Interview type">
            <select className="field">
              <option>Product thinking</option>
              <option>Coding</option>
              <option>System design</option>
              <option>Behavioral</option>
            </select>
          </Field>
          <Field label="Difficulty">
            <select className="field">
              <option>Medium</option>
              <option>Easy</option>
              <option>Hard</option>
            </select>
          </Field>
        </div>

        <div className="mt-7 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
          <div className="flex gap-3">
            <span className="rounded-lg bg-[#DCE6D8] p-2 text-[#176B50]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#24332B]">How this works</p>
              <p className="mt-1 text-xs leading-5 text-[#68766C]">
                You’ll answer three questions. MANGOS will give directional feedback on structure, clarity, and technical depth. Treat it as practice, not a prediction.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="mt-7 rounded-xl bg-[#176B50] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#104C3A]"
        >
          Start interview <Play className="ml-1 inline h-4 w-4 fill-current" />
        </button>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-[#5F7563]">{label}</span>
      {children}
    </label>
  );
}

function SkillGap({ navigate }: { navigate: (page: Page) => void }) {
  const [company, setCompany] = useState<CompanyName>('Meta');
  const [role, setRole] = useState('Software Engineering');
  const [analyzed, setAnalyzed] = useState(true);
  const skills = ['Data structures', 'System design', 'Product thinking', 'Communication', 'Distributed systems'];

  return (
    <div>
      <PageHeader
        eyebrow="Skill gap analyzer"
        title="Know what to work on next."
        detail="Get a focused snapshot of your strengths and the areas that will unlock your target role."
        action={
          <button
            onClick={() => setAnalyzed(true)}
            className="rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-sm font-bold text-[#24332B] shadow-sm hover:border-[#176B50]"
          >
            Re-run analysis <Radar className="ml-1 inline h-4 w-4 text-[#176B50]" />
          </button>
        }
      />
      <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Target company">
            <select
              value={company}
              onChange={(event) => {
                setCompany(event.target.value as CompanyName);
                setAnalyzed(false);
              }}
              className="field"
            >
              <option>Meta</option>
              {companies.slice(1).map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Target role">
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setAnalyzed(false);
              }}
              className="field"
            >
              <option>Software Engineering</option>
              <option>AI / ML Engineering</option>
              <option>Research Engineering</option>
              <option>Backend Development</option>
            </select>
          </Field>
        </div>
        <button
          onClick={() => setAnalyzed(true)}
          className="mt-6 rounded-xl bg-[#176B50] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#104C3A]"
        >
          Analyze my gap <ArrowRight className="ml-1 inline h-4 w-4" />
        </button>
      </section>

      {analyzed && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#176B50]">Your readiness</p>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{ background: 'conic-gradient(#176B50 0deg 248deg, #DDDCCF 248deg)' }}
              >
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white shadow-sm">
                  <span className="font-display text-2xl font-extrabold text-[#24332B]">69%</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#24332B]">Good foundation</p>
                <p className="mt-1 text-xs leading-5 text-[#68766C]">
                  You’re building range. Focus on the weak areas for your next jump.
                </p>
              </div>
            </div>
            <div className="mt-7 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
              <p className="text-xs font-bold text-[#24332B]">
                Targeting {role} at {company}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#68766C]">
                Based on your roadmap progress and saved practice activity.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-extrabold text-[#24332B]">Your skill map</h3>
            <div className="mt-5 space-y-4">
              {skills.map((skill, index) => (
                <div key={skill}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#24332B]">{skill}</span>
                    <span className={`text-xs font-bold ${index > 2 ? 'text-[#5F7563]' : 'text-[#176B50]'}`}>
                      {[86, 72, 62, 48, 34][index]}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#FAF8F2] border border-[#DDDCCF]">
                    <div
                      className={`h-full rounded-full ${index > 2 ? 'bg-[#A8B5A0]' : 'bg-[#176B50]'}`}
                      style={{ width: `${[86, 72, 62, 48, 34][index]}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#68766C]">
                    {index > 2 ? 'Recommended focus' : 'Strength to build on'}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('Roadmaps')}
              className="mt-7 rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-xs font-bold text-[#24332B] hover:border-[#176B50]"
            >
              View recommended roadmap <ArrowRight className="ml-1 inline h-3.5 w-3.5 text-[#176B50]" />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function ResumeAnalyzer({ notify }: { notify: (message: string) => void }) {
  const [analyzed, setAnalyzed] = useState(false);
  return (
    <div>
      <PageHeader
        eyebrow="Resume analyzer"
        title="Make your proof easier to see."
        detail="Upload a resume for a simulated ATS-style review, keyword gaps, and focused next steps."
      />
      <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 sm:p-8 shadow-sm">
        {!analyzed ? (
          <label className="flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DDDCCF] bg-[#FAF8F2] text-center transition hover:border-[#176B50] hover:bg-white">
            <span className="rounded-2xl bg-[#DCE6D8] p-4 text-[#176B50]">
              <Upload className="h-7 w-7" />
            </span>
            <span className="mt-5 text-sm font-bold text-[#24332B]">Drop your resume here</span>
            <span className="mt-2 text-xs text-[#68766C]">PDF or DOCX · Your file stays in this workspace</span>
            <span className="mt-5 rounded-xl bg-[#176B50] px-4 py-2.5 text-xs font-bold text-white shadow-sm">
              Choose file
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={() => {
                setAnalyzed(true);
                notify('Resume analysis complete');
              }}
            />
          </label>
        ) : (
          <div>
            <div className="flex flex-col justify-between gap-5 rounded-2xl border border-[#DDDCCF] bg-[#FAF8F2] p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <span className="rounded-xl bg-[#DCE6D8] p-3 text-[#176B50]">
                  <Check className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#24332B]">Jordan_Davis_Resume.pdf</p>
                  <p className="mt-1 text-xs text-[#68766C]">Analyzed just now · Software Engineering target</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-extrabold text-[#176B50]">78</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#68766C]">ATS-style score</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#176B50]">Strengths</p>
                <div className="mt-4 space-y-2 text-sm font-semibold text-[#24332B]">
                  <p>Clear project impact</p>
                  <p>Strong technical verbs</p>
                  <p>Good scannability</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F7563]">Missing keywords</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="tag">Distributed systems</span>
                  <span className="tag">Observability</span>
                  <span className="tag">Experimentation</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#104C3A]">Next actions</p>
                <div className="mt-4 space-y-2 text-sm font-semibold text-[#24332B]">
                  <p>Add measurable outcomes</p>
                  <p>Surface your systems work</p>
                  <p>Tailor for the target role</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAnalyzed(false)}
              className="mt-6 rounded-xl border border-[#DDDCCF] bg-white px-4 py-2.5 text-xs font-bold text-[#24332B] hover:bg-[#FAF8F2]"
            >
              Analyze another resume
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Bookmarks({
  state,
  toggleQuestionBookmark,
  toggleResourceBookmark,
  updateQuestion,
  navigate,
}: {
  state: State;
  toggleQuestionBookmark: (id: number) => void;
  toggleResourceBookmark: (id: string) => void;
  updateQuestion: (id: number, status: QuestionStatus) => void;
  navigate: (page: Page) => void;
}) {
  const [tab, setTab] = useState<'resources' | 'questions'>('resources');

  const savedQuestions = questions.filter((question) => state.bookmarks.includes(question.id));
  const savedResources = state.customResources.filter((resource) => state.resourceBookmarks.includes(resource.id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your space"
        title="Bookmarks & saved items."
        detail="Keep the learning resources and coding practice questions that deserve another pass close by."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-[#DDDCCF] bg-white p-1">
            <button
              onClick={() => setTab('resources')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === 'resources' ? 'bg-[#176B50] text-white shadow-sm' : 'text-[#68766C] hover:text-[#24332B]'
              }`}
            >
              Learning Resources ({savedResources.length})
            </button>
            <button
              onClick={() => setTab('questions')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === 'questions' ? 'bg-[#176B50] text-white shadow-sm' : 'text-[#68766C] hover:text-[#24332B]'
              }`}
            >
              Practice Questions ({savedQuestions.length})
            </button>
          </div>
        }
      />

      {tab === 'resources' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDDCCF] pb-3 text-xs text-[#68766C]">
            <span>{savedResources.length} saved learning resources</span>
            <button
              onClick={() => navigate('Learning Resources')}
              className="text-xs font-bold text-[#176B50] hover:underline"
            >
              Browse all learning resources →
            </button>
          </div>

          {savedResources.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={true}
                  onToggleBookmark={toggleResourceBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#DDDCCF] bg-white py-16 px-6 text-center shadow-sm">
              <span className="inline-flex rounded-2xl bg-[#FAF8F2] p-4 text-[#5F7563] border border-[#DDDCCF]">
                <Bookmark className="h-6 w-6" />
              </span>
              <h4 className="font-display mt-4 text-lg font-bold text-[#24332B]">No saved resources yet</h4>
              <p className="mt-2 text-xs text-[#68766C] max-w-sm mx-auto">
                Explore the Learning Resources library and bookmark materials to access them quickly from here.
              </p>
              <button
                onClick={() => navigate('Learning Resources')}
                className="mt-5 rounded-xl bg-[#176B50] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#104C3A]"
              >
                Go to Learning Resources
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#DDDCCF] pb-4">
            <div>
              <h3 className="font-display text-lg font-extrabold text-[#24332B]">Saved questions</h3>
              <p className="mt-1 text-xs text-[#68766C]">Your revision list · {savedQuestions.length} saved</p>
            </div>
            <button className="rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] px-3 py-2 text-xs font-bold text-[#24332B]">
              <Download className="mr-1 inline h-3.5 w-3.5" /> Export list
            </button>
          </div>
          {savedQuestions.length ? (
            <div className="divide-y divide-[#DDDCCF]">
              {savedQuestions.map((question) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  isBookmarked
                  onBookmark={() => toggleQuestionBookmark(question.id)}
                  onOpen={() => undefined}
                  onStatus={(status) => updateQuestion(question.id, status)}
                  state={state}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Bookmark} title="Your revision list is empty" detail="Bookmark a question in DSA Practice to see it here." />
          )}
        </section>
      )}
    </div>
  );
}

function Profile({ state, setState }: { state: State; setState: Dispatch<SetStateAction<State>> }) {
  return (
    <div>
      <PageHeader
        eyebrow="Your profile"
        title="Shape your preparation."
        detail="Keep your target role and company current so every recommendation stays relevant."
      />
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#176B50] text-xl font-extrabold text-white shadow-sm">
              JD
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold text-[#24332B]">Jordan Davis</h3>
              <p className="mt-1 text-sm text-[#68766C]">Student · {state.profile.school}</p>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <StatCard icon={Flame} label="Streak" value={`${state.streak}d`} detail="Personal best 18d" />
            <StatCard icon={Award} label="Earned" value="4" detail="Achievements" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-extrabold text-[#24332B]">Preparation preferences</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Target company">
              <select
                value={state.profile.company}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    profile: { ...current.profile, company: event.target.value as CompanyName },
                  }))
                }
                className="field"
              >
                <option>Meta</option>
                {companies.slice(1).map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Target role">
              <select
                value={state.profile.role}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    profile: { ...current.profile, role: event.target.value },
                  }))
                }
                className="field"
              >
                <option>Software Engineering</option>
                <option>AI / ML Engineering</option>
                <option>Research Engineering</option>
                <option>Backend Development</option>
              </select>
            </Field>

            <Field label="School">
              <input
                value={state.profile.school}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    profile: { ...current.profile, school: event.target.value },
                  }))
                }
                className="field"
              />
            </Field>
          </div>

          <div className="mt-7 rounded-xl border border-[#DDDCCF] bg-[#FAF8F2] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[#176B50]">
              <Bell className="h-4 w-4" /> Weekly progress digest
            </p>
            <p className="mt-1 text-xs text-[#68766C]">You’ll see your activity summary in the dashboard each week.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="py-16 text-center">
      <span className="inline-flex rounded-2xl bg-[#FAF8F2] p-3 text-[#5F7563] border border-[#DDDCCF]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-bold text-[#24332B]">{title}</p>
      <p className="mt-1 text-xs text-[#68766C]">{detail}</p>
    </div>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#DDDCCF] bg-white p-6 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default App;
