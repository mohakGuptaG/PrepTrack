/* =============================================================
   PrepTrack — script.js
   Vanilla JS | DOM manipulation | LocalStorage
   ============================================================= */

/* ── SECTION 1: APP STATE ──────────────────────────────────── */

/**
 * DSA topics data.
 * Each topic has: id, name, category, difficulty, solved/total problems
 */
const DSA_TOPICS = [
  { id: 'arrays',        name: 'Arrays & Strings',    category: 'Fundamentals',  difficulty: 'easy',   solved: 0,  total: 20 },
  { id: 'linked-list',   name: 'Linked Lists',         category: 'Fundamentals',  difficulty: 'easy',   solved: 0,  total: 15 },
  { id: 'stack-queue',   name: 'Stack & Queue',         category: 'Fundamentals',  difficulty: 'easy',   solved: 0,  total: 12 },
  { id: 'binary-search', name: 'Binary Search',         category: 'Searching',     difficulty: 'medium', solved: 0,  total: 10 },
  { id: 'sorting',       name: 'Sorting Algorithms',    category: 'Algorithms',    difficulty: 'medium', solved: 0,  total: 10 },
  { id: 'recursion',     name: 'Recursion',             category: 'Algorithms',    difficulty: 'medium', solved: 0,  total: 12 },
  { id: 'trees',         name: 'Trees & BST',           category: 'Non-Linear',    difficulty: 'medium', solved: 0,  total: 18 },
  { id: 'graphs',        name: 'Graphs (BFS/DFS)',      category: 'Non-Linear',    difficulty: 'hard',   solved: 0,  total: 15 },
  { id: 'dp',            name: 'Dynamic Programming',   category: 'Optimization',  difficulty: 'hard',   solved: 0,  total: 20 },
  { id: 'greedy',        name: 'Greedy Algorithms',     category: 'Optimization',  difficulty: 'hard',   solved: 0,  total: 10 },
  { id: 'backtrack',     name: 'Backtracking',          category: 'Algorithms',    difficulty: 'hard',   solved: 0,  total: 10 },
  { id: 'hashing',       name: 'Hashing & Maps',        category: 'Fundamentals',  difficulty: 'medium', solved: 0,  total: 8  },
];

/** Companies data */
const COMPANIES_DATA = [
  { id: 'google',    name: 'Google',       type: 'Product',  topics: ['Arrays','DP','Graphs','System Design'], color: '#7c83f5' },
  { id: 'amazon',    name: 'Amazon',       type: 'Product',  topics: ['Trees','DP','OOP','Leadership'],        color: '#f0a500' },
  { id: 'microsoft', name: 'Microsoft',    type: 'Product',  topics: ['Graphs','Trees','OS','Networking'],     color: '#2ec4b6' },
  { id: 'tcs',       name: 'TCS',          type: 'Service',  topics: ['Aptitude','C/C++','DBMS','Networking'], color: '#e05c7a' },
  { id: 'infosys',   name: 'Infosys',      type: 'Service',  topics: ['Aptitude','Java','SQL','SDLC'],         color: '#7c83f5' },
  { id: 'wipro',     name: 'Wipro',        type: 'Service',  topics: ['Aptitude','Python','DBMS','HR'],        color: '#2ec4b6' },
  { id: 'flipkart',  name: 'Flipkart',     type: 'Product',  topics: ['Arrays','Hashing','LLD','Scalability'], color: '#f0a500' },
  { id: 'razorpay',  name: 'Razorpay',     type: 'Startup',  topics: ['Payments','APIs','Security','DSA'],     color: '#e05c7a' },
  { id: 'meesho',    name: 'Meesho',       type: 'Startup',  topics: ['DSA','React','Node.js','SQL'],          color: '#7c83f5' },
];

/** Daily tips shown in rotation */
const TIPS = [
  'Consistency beats intensity. Solving 2–3 problems every day outperforms 20 problems once a week.',
  'After solving a problem, always revisit it after 3 days — spaced repetition locks it in.',
  'For interviews, explaining your thought process matters as much as the correct answer.',
  'Master sliding window and two-pointer patterns — they appear in 30%+ of array problems.',
  'Read the problem twice before coding. Misunderstanding costs more time than thinking.',
  'Focus on understanding WHY a solution works, not just memorising it.',
  'Practice writing clean, readable code even during prep — it matters in interviews.',
  'BFS is for shortest path in unweighted graphs. DFS is for connectivity and cycles.',
];

/** LocalStorage keys */
const STORAGE_KEYS = {
  theme:     'pt_theme',
  dsa:       'pt_dsa',       // { topicId: { done: bool, solved: number } }
  goals:     'pt_goals',     // [{ id, text, done }]
  companies: 'pt_companies', // { companyId: { prep: 0-100 } }
};

/* ── SECTION 2: LOAD / SAVE HELPERS ──────────────────────────*/

/** Load data from localStorage, return defaultValue if not found */
function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** Save data to localStorage */
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('PrepTrack: LocalStorage save failed', e);
  }
}

/* ── SECTION 3: THEME ─────────────────────────────────────── */

const html       = document.documentElement;
const themeBtn   = document.getElementById('themeToggle');
const themeIcon  = document.getElementById('themeIcon');

/** Apply a theme ('dark' | 'light') to the document */
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
  save(STORAGE_KEYS.theme, theme);
}

/** Toggle between dark and light */
function toggleTheme() {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

themeBtn.addEventListener('click', toggleTheme);

/* ── SECTION 4: NAVIGATION (SPA-style sections) ──────────── */

const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sections     = document.querySelectorAll('.section');

/**
 * Activate a section by its id, update sidebar link highlight.
 * @param {string} sectionId - id of the <section> element
 */
function activateSection(sectionId) {
  // Hide all sections
  sections.forEach(s => s.classList.remove('active'));
  // Show target
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  // Update sidebar link states
  sidebarLinks.forEach(link => {
    const isActive = link.getAttribute('data-section') === sectionId;
    link.classList.toggle('active', isActive);
  });

  // Close mobile sidebar when navigating
  closeMobileSidebar();
}

// Attach click listeners to sidebar links
sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    activateSection(link.getAttribute('data-section'));
  });
});

/* ── SECTION 5: MOBILE SIDEBAR ────────────────────────────── */

const sidebar   = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');

// Create overlay element dynamically
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

function openMobileSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  hamburger.setAttribute('aria-expanded', 'true');
}

function closeMobileSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeMobileSidebar() : openMobileSidebar();
});

overlay.addEventListener('click', closeMobileSidebar);

/* ── SECTION 6: DSA TRACKER ──────────────────────────────── */

const dsaList = document.getElementById('dsaList');

/** Load saved DSA state from localStorage */
let dsaState = load(STORAGE_KEYS.dsa, {});

/**
 * Render the DSA topic list into #dsaList.
 * Each item shows: checkbox, name, category, difficulty badge, progress bar.
 */
function renderDSA() {
  dsaList.innerHTML = ''; // Clear first

  DSA_TOPICS.forEach(topic => {
    const state   = dsaState[topic.id] || { done: false, solved: topic.solved };
    const pct     = Math.round((state.solved / topic.total) * 100);
    const isDone  = state.done;

    const li = document.createElement('li');
    li.className = `dsa-item${isDone ? ' done' : ''}`;
    li.setAttribute('data-id', topic.id);
    li.setAttribute('data-difficulty', topic.difficulty);
    li.setAttribute('data-done', isDone);
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-label', `${topic.name}, ${topic.difficulty}, ${isDone ? 'completed' : 'pending'}`);
    li.setAttribute('tabindex', '0');

    li.innerHTML = `
      <div class="dsa-check" aria-hidden="true">${isDone ? '✓' : ''}</div>
      <div class="dsa-info">
        <div class="dsa-name">${topic.name}</div>
        <div class="dsa-meta">${topic.category} · ${state.solved}/${topic.total} solved</div>
      </div>
      <span class="badge badge-${topic.difficulty}">${topic.difficulty}</span>
      <div class="dsa-progress" aria-label="${pct}% complete">
        <span class="dsa-pct">${pct}%</span>
        <div class="dsa-bar-track">
          <div class="dsa-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;

    // Click to toggle done state
    li.addEventListener('click', () => toggleDSATopic(topic.id));
    // Keyboard support
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDSATopic(topic.id);
      }
    });

    dsaList.appendChild(li);
  });
}

/** Toggle a DSA topic between done and pending */
function toggleDSATopic(topicId) {
  if (!dsaState[topicId]) {
    const topic = DSA_TOPICS.find(t => t.id === topicId);
    dsaState[topicId] = { done: false, solved: topic.solved };
  }
  // Mark as done = set solved to total, undone = reset
  const topic = DSA_TOPICS.find(t => t.id === topicId);
  const wassDone = dsaState[topicId].done;
  dsaState[topicId].done   = !wassDone;
  dsaState[topicId].solved = !wassDone ? topic.total : 0;

  save(STORAGE_KEYS.dsa, dsaState);
  renderDSA();
  applyDSAFilter(currentDSAFilter); // Re-apply active filter
  updateDashboard();
}

/* DSA Filter */
let currentDSAFilter = 'all';
const dsaFilterBtns = document.querySelectorAll('[data-filter]');

dsaFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    dsaFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDSAFilter = btn.getAttribute('data-filter');
    applyDSAFilter(currentDSAFilter);
  });
});

/** Show/hide DSA items based on filter value ('all' | 'done' | 'pending') */
function applyDSAFilter(filter) {
  const items = dsaList.querySelectorAll('.dsa-item');
  items.forEach(item => {
    const isDone = item.getAttribute('data-done') === 'true';
    if (filter === 'all')    item.classList.remove('hidden');
    else if (filter === 'done')   item.classList.toggle('hidden', !isDone);
    else if (filter === 'pending') item.classList.toggle('hidden', isDone);
  });
}

/* ── SECTION 7: GOALS ─────────────────────────────────────── */

const goalInput   = document.getElementById('goalInput');
const addGoalBtn  = document.getElementById('addGoalBtn');
const goalsList   = document.getElementById('goalsList');
const goalsEmpty  = document.getElementById('goalsEmpty');

/** In-memory goals array (synced with localStorage) */
let goals = load(STORAGE_KEYS.goals, []);

/** Render all goals into the list */
function renderGoals() {
  goalsList.innerHTML = '';

  goals.forEach(goal => {
    const li = document.createElement('li');
    li.className = `goal-item${goal.done ? ' done-goal' : ''}`;
    li.setAttribute('data-id', goal.id);

    li.innerHTML = `
      <button class="goal-checkbox" aria-label="${goal.done ? 'Unmark' : 'Mark'} goal: ${goal.text}">
        ${goal.done ? '✓' : ''}
      </button>
      <span class="goal-text">${escapeHTML(goal.text)}</span>
      <button class="goal-delete" aria-label="Delete goal: ${goal.text}" title="Delete">×</button>
    `;

    // Toggle done
    li.querySelector('.goal-checkbox').addEventListener('click', () => toggleGoal(goal.id));
    // Delete
    li.querySelector('.goal-delete').addEventListener('click', () => deleteGoal(goal.id));

    goalsList.appendChild(li);
  });

  // Show/hide empty state
  goalsEmpty.classList.toggle('visible', goals.length === 0);
  updateDashboard();
}

/** Add a new goal */
function addGoal() {
  const text = goalInput.value.trim();
  if (!text) return;

  goals.push({ id: Date.now().toString(), text, done: false });
  save(STORAGE_KEYS.goals, goals);
  goalInput.value = '';
  renderGoals();
}

/** Toggle a goal's done state */
function toggleGoal(id) {
  goals = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
  save(STORAGE_KEYS.goals, goals);
  renderGoals();
}

/** Delete a goal */
function deleteGoal(id) {
  goals = goals.filter(g => g.id !== id);
  save(STORAGE_KEYS.goals, goals);
  renderGoals();
}

// Add button + Enter key
addGoalBtn.addEventListener('click', addGoal);
goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addGoal(); });

/* ── SECTION 8: COMPANIES ─────────────────────────────────── */

const companyGrid = document.getElementById('companyGrid');

/** Company progress state { companyId: { prep: 0-100 } } */
let companyState = load(STORAGE_KEYS.companies, {});

/** Render all company cards */
function renderCompanies() {
  companyGrid.innerHTML = '';

  COMPANIES_DATA.forEach(company => {
    const state = companyState[company.id] || { prep: 0 };
    const pct   = Math.min(100, Math.max(0, state.prep));

    const li = document.createElement('li');
    li.className = 'company-card';
    li.setAttribute('data-type', company.type);
    li.setAttribute('role', 'listitem');

    // Choose bar color based on company type
    const barColor = company.type === 'Product'
      ? 'var(--accent-indigo)'
      : company.type === 'Service'
      ? 'var(--accent-teal)'
      : 'var(--accent-rose)';

    li.innerHTML = `
      <div class="company-header">
        <span class="company-name">${company.name}</span>
        <span class="company-type-badge type-${company.type.toLowerCase()}">${company.type}</span>
      </div>
      <div class="company-topics">
        ${company.topics.map(t => `<span class="topic-chip">${t}</span>`).join('')}
      </div>
      <div class="company-prep-label">
        Prep Progress <span class="company-pct">${pct}%</span>
      </div>
      <div class="company-bar-track">
        <div class="company-bar-fill" style="width:${pct}%; background:${barColor}"></div>
      </div>
      <div class="company-actions">
        <button class="company-btn increment" data-id="${company.id}" aria-label="Increase ${company.name} prep by 10%">+10%</button>
        <button class="company-btn" data-id="${company.id}" data-reset="true" aria-label="Reset ${company.name} prep">Reset</button>
      </div>
    `;

    // +10% button
    li.querySelector('.increment').addEventListener('click', () => {
      incrementCompany(company.id);
    });
    // Reset button
    li.querySelector('[data-reset]').addEventListener('click', () => {
      resetCompany(company.id);
    });

    companyGrid.appendChild(li);
  });

  updateDashboard();
}

/** Increment company prep by 10 (max 100) */
function incrementCompany(id) {
  if (!companyState[id]) companyState[id] = { prep: 0 };
  companyState[id].prep = Math.min(100, companyState[id].prep + 10);
  save(STORAGE_KEYS.companies, companyState);
  renderCompanies();
  applyCompanyFilter(currentCompanyFilter);
}

/** Reset company prep to 0 */
function resetCompany(id) {
  companyState[id] = { prep: 0 };
  save(STORAGE_KEYS.companies, companyState);
  renderCompanies();
  applyCompanyFilter(currentCompanyFilter);
}

/* Company filter */
let currentCompanyFilter = 'all';
const companyFilterBtns = document.querySelectorAll('[data-company-filter]');

companyFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    companyFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCompanyFilter = btn.getAttribute('data-company-filter');
    applyCompanyFilter(currentCompanyFilter);
  });
});

/** Show/hide company cards based on type filter */
function applyCompanyFilter(filter) {
  const cards = companyGrid.querySelectorAll('.company-card');
  cards.forEach(card => {
    const type = card.getAttribute('data-type');
    card.classList.toggle('hidden', filter !== 'all' && type !== filter);
  });
}

/* ── SECTION 9: GLOBAL SEARCH ─────────────────────────────── */

const globalSearch       = document.getElementById('globalSearch');
const globalSearchMobile = document.getElementById('globalSearchMobile');

/**
 * Search filters both DSA items and company cards simultaneously.
 * @param {string} query - raw search text
 */
function handleSearch(query) {
  const q = query.toLowerCase().trim();

  // Filter DSA items
  const dsaItems = dsaList.querySelectorAll('.dsa-item');
  dsaItems.forEach(item => {
    const name = item.querySelector('.dsa-name').textContent.toLowerCase();
    const meta = item.querySelector('.dsa-meta').textContent.toLowerCase();
    item.classList.toggle('hidden', q !== '' && !name.includes(q) && !meta.includes(q));
  });

  // Filter company cards
  const companyCards = companyGrid.querySelectorAll('.company-card');
  companyCards.forEach(card => {
    const name   = card.querySelector('.company-name').textContent.toLowerCase();
    const topics = card.querySelector('.company-topics').textContent.toLowerCase();
    card.classList.toggle('hidden', q !== '' && !name.includes(q) && !topics.includes(q));
  });

  // If there's a query, jump to dsa or companies section based on what matches
  // (Only auto-navigate if not already on a relevant section)
}

globalSearch.addEventListener('input',       (e) => handleSearch(e.target.value));
globalSearchMobile.addEventListener('input', (e) => handleSearch(e.target.value));

/* ── SECTION 10: DASHBOARD UPDATE ────────────────────────── */

/**
 * Recalculate all stats and update the Overview cards + sidebar score.
 */
function updateDashboard() {
  /* --- Problems Solved --- */
  let totalSolved = 0;
  const TOTAL_PROBLEMS = 150;
  DSA_TOPICS.forEach(topic => {
    const state = dsaState[topic.id];
    totalSolved += state ? state.solved : 0;
  });
  const solvedPct = Math.round((totalSolved / TOTAL_PROBLEMS) * 100);
  document.getElementById('statSolved').textContent = totalSolved;
  document.getElementById('barSolved').style.width  = `${Math.min(100, solvedPct)}%`;

  /* --- Topics Mastered --- */
  const TOTAL_TOPICS = DSA_TOPICS.length;
  const mastered = Object.values(dsaState).filter(s => s.done).length;
  const masteredPct = Math.round((mastered / TOTAL_TOPICS) * 100);
  document.getElementById('statTopics').textContent = mastered;
  document.getElementById('barTopics').style.width  = `${masteredPct}%`;

  /* --- Goals Done Today --- */
  const totalGoals = goals.length;
  const doneGoals  = goals.filter(g => g.done).length;
  const goalsPct   = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;
  document.getElementById('statGoals').textContent    = doneGoals;
  document.getElementById('statGoalsSub').textContent = `of ${totalGoals} set`;
  document.getElementById('barGoals').style.width     = `${goalsPct}%`;

  /* --- Companies Tracked --- */
  const tracked = COMPANIES_DATA.filter(c => (companyState[c.id]?.prep || 0) > 0).length;
  const trackedPct = Math.round((tracked / COMPANIES_DATA.length) * 100);
  document.getElementById('statCompanies').textContent = tracked;
  document.getElementById('barCompanies').style.width  = `${trackedPct}%`;

  /* --- Overall Readiness (sidebar) --- */
  const overall = Math.round((solvedPct * 0.4) + (masteredPct * 0.3) + (goalsPct * 0.15) + (trackedPct * 0.15));
  document.getElementById('overallScore').textContent  = `${overall}%`;
  document.getElementById('overallBar').style.width    = `${overall}%`;
}

/* ── SECTION 11: TIP OF THE DAY ──────────────────────────── */

function showDailyTip() {
  // Pick a tip based on the day of the year (so it changes daily)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const tip = TIPS[dayOfYear % TIPS.length];
  document.getElementById('tipText').textContent = tip;
}

/* ── SECTION 12: FOOTER YEAR ─────────────────────────────── */

document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── SECTION 13: UTILITIES ────────────────────────────────── */

/**
 * Escape HTML to prevent XSS when inserting user input into the DOM.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ── SECTION 14: INITIALISE APP ──────────────────────────── */

function init() {
  // 1. Apply saved theme (or default dark)
  const savedTheme = load(STORAGE_KEYS.theme, 'dark');
  applyTheme(savedTheme);

  // 2. Render all data
  renderDSA();
  renderGoals();
  renderCompanies();

  // 3. Update dashboard stats
  updateDashboard();

  // 4. Show daily tip
  showDailyTip();

  // 5. Start on Overview section
  activateSection('overview');
}

// Kick it off!
init();
