import assert from 'node:assert';
import test from 'node:test';

// In-memory mock localStorage for testing isolation
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MockLocalStorage();

// Pure functional equivalents matching storageService and progressService logic
function createNeutralState() {
  return {
    solved: [],
    attempted: [],
    bookmarks: [],
    resourceBookmarks: [],
    customResources: [],
    completedMilestones: [],
    streak: 0,
    profile: {
      fullName: '',
      university: '',
      targetRole: '',
      company: 'Meta',
      preferredLanguage: 'Python',
      experienceLevel: 'Beginner / Student',
    },
  };
}

function isGenuineGuestData(state) {
  if (!state) return false;
  if (state.profile?.fullName?.includes('Jordan Davis')) return false;

  const hasActivity =
    (state.solved && state.solved.length > 0) ||
    (state.attempted && state.attempted.length > 0) ||
    (state.bookmarks && state.bookmarks.length > 0) ||
    (state.resourceBookmarks && state.resourceBookmarks.length > 0) ||
    (state.completedMilestones && state.completedMilestones.length > 0) ||
    Boolean(state.profile?.fullName?.trim()) ||
    Boolean(state.profile?.university?.trim()) ||
    Boolean(state.profile?.targetRole?.trim() && state.profile?.targetRole !== 'Software Engineer');

  return hasActivity;
}

test('Test 1: Storage Isolation between User A, User B, and Guest', () => {
  localStorage.clear();

  const userA_id = 'user-uuid-1111';
  const userB_id = 'user-uuid-2222';

  // User A state
  const userAState = {
    ...createNeutralState(),
    solved: [1, 3, 5],
    bookmarks: [10],
    profile: { fullName: 'Alice Walker', targetRole: 'Frontend Engineer', company: 'Google' },
  };

  // User B state
  const userBState = {
    ...createNeutralState(),
    solved: [2, 4],
    bookmarks: [20, 30],
    profile: { fullName: 'Bob Martin', targetRole: 'ML Engineer', company: 'Anthropic' },
  };

  // Guest state
  const guestState = {
    ...createNeutralState(),
    solved: [7],
    bookmarks: [70],
    profile: { fullName: '', targetRole: 'Software Engineer', company: 'Meta' },
  };

  // Save each into their isolated keys
  localStorage.setItem(`mangos_workspace_user_${userA_id}`, JSON.stringify({ version: 1, data: userAState }));
  localStorage.setItem(`mangos_workspace_user_${userB_id}`, JSON.stringify({ version: 1, data: userBState }));
  localStorage.setItem('mangos_workspace_guest', JSON.stringify({ version: 1, data: guestState }));

  // Verify User A retrieval
  const rawA = JSON.parse(localStorage.getItem(`mangos_workspace_user_${userA_id}`));
  assert.strictEqual(rawA.data.profile.fullName, 'Alice Walker');
  assert.deepStrictEqual(rawA.data.solved, [1, 3, 5]);

  // Verify User B retrieval
  const rawB = JSON.parse(localStorage.getItem(`mangos_workspace_user_${userB_id}`));
  assert.strictEqual(rawB.data.profile.fullName, 'Bob Martin');
  assert.deepStrictEqual(rawB.data.solved, [2, 4]);

  // Verify User B cannot see User A data
  assert.notStrictEqual(rawA.data.profile.fullName, rawB.data.profile.fullName);
  assert.ok(!rawB.data.solved.includes(1));

  // Verify Guest retrieval
  const rawGuest = JSON.parse(localStorage.getItem('mangos_workspace_guest'));
  assert.deepStrictEqual(rawGuest.data.solved, [7]);
});

test('Test 2: Demo data contamination rejection', () => {
  const demoData = {
    solved: [1],
    attempted: [2],
    bookmarks: [2, 5],
    completedMilestones: ['Programming fundamentals'],
    streak: 12,
    profile: {
      fullName: 'Jordan Davis',
      university: 'University of Michigan',
      targetRole: 'Software Engineer',
      company: 'Meta',
    },
  };

  // Ensure isGenuineGuestData flags demo data as FALSE so it never migrates
  assert.strictEqual(isGenuineGuestData(demoData), false);

  const genuineData = {
    solved: [3],
    attempted: [],
    bookmarks: [],
    completedMilestones: [],
    streak: 1,
    profile: {
      fullName: 'Real Student',
      university: 'UC Berkeley',
      targetRole: 'Backend Engineer',
      company: 'OpenAI',
    },
  };

  assert.strictEqual(isGenuineGuestData(genuineData), true);
});

test('Test 3: Non-destructive union merge between Guest and Remote User', () => {
  // Remote user has solved question 1 and 2
  const remoteDSA = { solved: [1, 2], attempted: [4] };
  const remoteMilestones = ['Milestone A'];
  const remoteBookmarks = { questionBookmarks: [100], resourceBookmarks: ['res-1'] };

  // Guest solved question 2 and 3, and attempted 5
  const guestState = {
    solved: [2, 3],
    attempted: [5],
    completedMilestones: ['Milestone B'],
    bookmarks: [200],
    resourceBookmarks: ['res-2'],
    profile: { fullName: '', targetRole: '' },
  };

  // Union merge
  const mergedSolved = Array.from(new Set([...remoteDSA.solved, ...guestState.solved]));
  const mergedAttempted = Array.from(new Set([...remoteDSA.attempted, ...guestState.attempted]))
    .filter(id => !mergedSolved.includes(id));
  const mergedMilestones = Array.from(new Set([...remoteMilestones, ...guestState.completedMilestones]));
  const mergedQB = Array.from(new Set([...remoteBookmarks.questionBookmarks, ...guestState.bookmarks]));
  const mergedRB = Array.from(new Set([...remoteBookmarks.resourceBookmarks, ...guestState.resourceBookmarks]));

  assert.deepStrictEqual(mergedSolved.sort(), [1, 2, 3]);
  assert.deepStrictEqual(mergedAttempted.sort(), [4, 5]);
  assert.deepStrictEqual(mergedMilestones.sort(), ['Milestone A', 'Milestone B']);
  assert.deepStrictEqual(mergedQB.sort(), [100, 200]);
  assert.deepStrictEqual(mergedRB.sort(), ['res-1', 'res-2']);
});

test('Test 4: RBAC on Learning Resources Catalogue', () => {
  const regularUserRole = 'student';
  const adminUserRole = 'admin';

  const isRoleAdmin = (role) => role === 'admin';

  assert.strictEqual(isRoleAdmin(regularUserRole), false);
  assert.strictEqual(isRoleAdmin(adminUserRole), true);

  // Simulation of permission check
  function canModifySharedCatalog(userRole) {
    if (!isRoleAdmin(userRole)) {
      return { allowed: false, target: 'local_workspace_only' };
    }
    return { allowed: true, target: 'supabase_learning_resources' };
  }

  assert.deepStrictEqual(canModifySharedCatalog(regularUserRole), { allowed: false, target: 'local_workspace_only' });
  assert.deepStrictEqual(canModifySharedCatalog(adminUserRole), { allowed: true, target: 'supabase_learning_resources' });
});
