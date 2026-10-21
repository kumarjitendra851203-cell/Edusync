/* ═══════════ STUDENT: resources, quiz, analytics, placement, bus, library ═══════════ */

/* ── Study hub ── */
let activeSubject = 'All';
function renderStudentResources(filter = '') {
  const subjects = ['All', ...new Set(state.resources.map(r => r.subject))];
  const te = document.getElementById('s-subject-tabs');
  if (te) te.innerHTML = subjects.map(s => `<div class="tab-pill${s === activeSubject ? ' active' : ''}" onclick="setSubjectTab(this.dataset.s)" data-s="${esc(s)}">${s === 'All' ? 'All' : esc(s.split(' ').map(w => w[0]).join(''))}</div>`).join('');
  const search = document.getElementById('s-search')?.value || filter;
  let list = state.resources;
  if (activeSubject !== 'All') list = list.filter(r => r.subject === activeSubject);
  if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase()));
  const el = document.getElementById('s-resource-list'); if (!el) return;
  if (!list.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-txt">No resources found</div></div>'; return; }
  el.innerHTML = list.map(r => `<div class="res-item">
    <div class="res-icon ${rtypes[r.type]?.cls || 'pdf'}">${rtypes[r.type]?.icon || '📄'}</div>
    <div class="res-meta"><div class="res-name">${esc(r.title)}</div><div class="res-sub">${esc(r.subject)} ${r.size ? '· ' + esc(r.size) : ''}</div></div>
    <div class="res-actions">
      <div class="icon-btn" onclick="toggleBM(${r.id})">${r.bookmarked ? '🔖' : '🤍'}</div>
      <div class="icon-btn" onclick="openResource(${r.id})">↗</div>
    </div>
  </div>`).join('');
  updateStudentStats();
}
function openResource(id) {
  const r = state.resources.find(x => x.id === id);
  if (r?.url && /^https?:\/\//i.test(r.url)) window.open(r.url, '_blank', 'noopener');
  else showToast('Opening… (demo resource)', true);
}
function setSubjectTab(s) { activeSubject = s; renderStudentResources(); }
function filterResources(v) { renderStudentResources(v); }
function toggleBM(id) {
  const r = state.resources.find(x => x.id === id); if (!r) return;
  r.bookmarked = !r.bookmarked; renderStudentResources(); showToast(r.bookmarked ? 'Bookmarked!' : 'Removed', r.bookmarked);
}

/* ── Quiz ── */
function renderStudentQuizList() {
  const el = document.getElementById('s-quiz-list'); if (!el) return;
  const done = new Set(state.studentResults.map(r => r.quizId));
  el.innerHTML = state.quizzes.filter(q => q.published).map(q => `<div class="quiz-card">
    <div class="quiz-q-title" style="font-family:'Outfit',sans-serif">${esc(q.title)}</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:14px">${esc(q.subject)} · ${q.questions.length}Q ${done.has(q.id) ? '· <span style="color:var(--green)">✓ Done</span>' : ''}</div>
    <button class="btn btn-blue btn-sm" onclick="startQuiz(${q.id})">${done.has(q.id) ? 'Retake' : 'Start Quiz →'}</button>
  </div>`).join('');
}
function renderStudentUpcoming() {
  const el = document.getElementById('s-upcoming'); if (!el) return;
  el.innerHTML = state.quizzes.filter(q => q.published).slice(0, 3).map(q => `<div class="check-row">
    <div class="chk-circle" onclick="navTo('s-quiz',3)">→</div>
    <div><div style="font-size:13px;font-weight:600">${esc(q.title)}</div><div style="font-size:11px;color:var(--text2)">${esc(q.subject)} · ${q.questions.length} questions</div></div>
  </div>`).join('');
}
function startQuiz(id) {
  const quiz = state.quizzes.find(q => q.id === id); if (!quiz) return;
  state.currentQuiz = quiz; state.currentQIdx = 0; state.currentAnswers = [];
  document.getElementById('s-quiz-list-view').style.display = 'none';
  document.getElementById('s-quiz-take-view').style.display = 'block';
  document.getElementById('s-quiz-result-view').style.display = 'none';
  document.getElementById('s-quiz-taking-title').textContent = quiz.title;
  renderQ();
}
function renderQ() {
  const quiz = state.currentQuiz, qi = state.currentQIdx, q = quiz.questions[qi];
  document.getElementById('s-q-counter').textContent = `${qi + 1}/${quiz.questions.length}`;
  document.getElementById('s-progress-bar').style.width = `${(qi / quiz.questions.length) * 100}%`;
  const nb = document.getElementById('s-next-btn');
  nb.disabled = true; nb.textContent = qi === quiz.questions.length - 1 ? 'Submit ✓' : 'Next →';
  document.getElementById('s-quiz-q-area').innerHTML = `<div class="quiz-card"><div class="quiz-q-title">${esc(q.q)}</div>
    <div class="quiz-opts">${q.options.map((opt, oi) => `<button class="quiz-opt" onclick="selOpt(this,${oi})">${esc(opt)}</button>`).join('')}</div></div>`;
}
function selOpt(el, oi) {
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel'); state.currentAnswers[state.currentQIdx] = oi;
  document.getElementById('s-next-btn').disabled = false;
}
function nextQuestion() {
  if (state.currentQIdx < state.currentQuiz.questions.length - 1) { state.currentQIdx++; renderQ(); }
  else showResults();
}
function showResults() {
  const quiz = state.currentQuiz; let score = 0;
  quiz.questions.forEach((q, i) => { if (state.currentAnswers[i] === q.correct) score++; });
  const total = quiz.questions.length, acc = Math.round(score / total * 100);
  state.studentResults.push({ quizId: quiz.id, quizTitle: quiz.title, score, total, accuracy: acc, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), subject: quiz.subject });
  document.getElementById('s-quiz-take-view').style.display = 'none';
  document.getElementById('s-quiz-result-view').style.display = 'block';
  document.getElementById('s-result-title').textContent = quiz.title;
  document.getElementById('s-score-num').textContent = `${score}/${total}`;
  const badge = document.getElementById('s-acc-badge');
  badge.textContent = `${acc}% Accuracy`;
  const c = acc >= 80 ? ['34,197,94', 'var(--green)'] : acc >= 50 ? ['245,158,11', 'var(--amber)'] : ['239,68,68', 'var(--red)'];
  badge.style.background = `rgba(${c[0]},.12)`; badge.style.color = c[1];
  document.getElementById('s-review').innerHTML = quiz.questions.map((q, i) => {
    const ua = state.currentAnswers[i], ok = ua === q.correct;
    return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:12px;font-weight:600;margin-bottom:5px">${i + 1}. ${esc(q.q)}</div>
      <div style="font-size:11px;color:${ok ? 'var(--green)' : 'var(--red)'}">Your: ${esc(q.options[ua] ?? '—')} ${ok ? '✓' : '✗'}</div>
      ${!ok ? `<div style="font-size:11px;color:var(--text2)">Correct: ${esc(q.options[q.correct])}</div>` : ''}
    </div>`;
  }).join('');
  updateStudentStats(); renderTeacherResults();
}
function backToQuizList() {
  document.getElementById('s-quiz-list-view').style.display = 'block';
  document.getElementById('s-quiz-take-view').style.display = 'none';
  document.getElementById('s-quiz-result-view').style.display = 'none';
  renderStudentQuizList();
}

/* ── Analytics ── */
function renderAnalytics() {
  if (!state.studentResults.length) {
    ['an-bars', 'an-history'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-txt">Take a quiz to see your analytics</div></div>'; });
    ['an-avg', 'an-best'].forEach(id => { document.getElementById(id).textContent = '—'; });
    return;
  }
  const accs = state.studentResults.map(r => r.accuracy);
  document.getElementById('an-avg').textContent = Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) + '%';
  document.getElementById('an-best').textContent = Math.max(...accs) + '%';
  document.getElementById('an-done').textContent = state.studentResults.length;
  const byS = {};
  state.studentResults.forEach(r => { (byS[r.subject] = byS[r.subject] || []).push(r.accuracy); });
  const colors = ['var(--blue2)', 'var(--teal)', 'var(--purple)', 'var(--amber)', 'var(--green)'];
  document.getElementById('an-bars').innerHTML = Object.entries(byS).map(([s, a], i) => {
    const av = Math.round(a.reduce((x, y) => x + y, 0) / a.length), c = colors[i % colors.length];
    return `<div class="chart-row"><div class="chart-lbl">${esc(s.split(' ')[0])}</div><div class="chart-track"><div class="chart-fill" style="width:${av}%;background:${c}"></div></div><div class="chart-val" style="color:${c}">${av}%</div></div>`;
  }).join('');
  document.getElementById('an-history').innerHTML = state.studentResults.slice().reverse().map(r => `<div class="result-row">
    <div><div class="result-label">${esc(r.quizTitle)}</div><div style="font-size:11px;color:var(--muted)">${esc(r.time)}</div></div>
    <div class="result-val" style="color:${r.accuracy >= 80 ? 'var(--green)' : r.accuracy >= 50 ? 'var(--amber)' : 'var(--red)'}">${r.score}/${r.total}</div></div>`).join('');
}
function updateStudentStats() {
  const bk = state.resources.filter(r => r.bookmarked).length, done = state.studentResults.length;
  const avg = done ? Math.round(state.studentResults.reduce((a, r) => a + r.accuracy, 0) / done) + '%' : '—';
  document.getElementById('s-avg-score').textContent = avg;
  document.getElementById('s-quizzes-done').textContent = done;
  document.getElementById('s-bookmarks').textContent = bk;
}

/* ── Placement board ── */
let placementSearchQuery = '';
function setPlacementTab(tier, el) {
  state.currentPlacementTier = tier;
  document.querySelectorAll('#placement-filter-tabs .tab-pill').forEach(t => t.classList.remove('active', 'blue'));
  el.classList.add('active', 'blue'); renderStudentPlacements();
}
function filterPlacements(v) { placementSearchQuery = v; renderStudentPlacements(); }
function renderStudentPlacements() {
  const el = document.getElementById('s-placement-list'); if (!el) return;
  let list = state.placements;
  if (state.currentPlacementTier !== 'all') list = list.filter(p => p.tier === state.currentPlacementTier);
  const q = placementSearchQuery.toLowerCase();
  if (q) list = list.filter(p => p.company.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  if (!list.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💼</div><div class="empty-state-txt">No results found</div></div>'; return; }
  el.innerHTML = list.map(p => `<div class="placement-card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
      <div style="display:flex;gap:10px;align-items:center"><div class="co-logo">${p.emoji}</div><div><div class="co-name">${esc(p.company)}</div><div class="co-role">${esc(p.role)}</div></div></div>
      <div style="text-align:right"><div class="co-pkg">${esc(p.package.split('–')[0])}+</div><div style="font-size:10px;color:var(--text2)">package</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--text2);margin-bottom:8px">
      <span>🎓 CGPA ≥ ${p.cgpa}</span>
      <span class="tag ${p.type === 'Mass Hiring' ? 'tag-amber' : 'tag-green'}">${esc(p.type)}</span>
      <span class="tag ${p.tier === 'high' ? 'tag-green' : p.tier === 'avg' ? 'tag-blue' : 'tag-teal'}">${p.tier === 'high' ? 'High Pkg' : p.tier === 'avg' ? 'Average' : 'Mass Hiring'}</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">${p.skills.map(s => `<span class="tag tag-blue">${esc(s)}</span>`).join('')}</div>
    <button class="btn btn-blue btn-sm" onclick="showToast('Applied to ${esc(p.company).replace(/'/g, '')}! ✓',true)">Apply Now →</button>
  </div>`).join('');
}

/* ── Bus routes ── */
function renderBus() {
  const el = document.getElementById('bus-list'); if (!el || el.innerHTML !== '') return;
  el.innerHTML = BUS_ROUTES.map((r, i) => `<div class="bus-card">
    <div class="bus-header" onclick="toggleBus(${i})">
      <div class="bus-num">Route ${r.num}</div>
      <div class="bus-route-name">${r.name}${r.badge ? ' <span class="tag tag-teal" style="font-size:9px">3 BUSES</span>' : ''}</div>
      <div class="bus-chevron" id="bch-${i}">▼</div>
    </div>
    <div class="bus-body" id="bb-${i}">${r.stops.map(s => `<div class="bus-stop"><div class="bus-time">${s.t}</div><div class="bus-dot">●</div><div class="bus-stop-name">${s.n}</div></div>`).join('')}</div>
  </div>`).join('');
}
function toggleBus(i) {
  document.getElementById(`bb-${i}`).classList.toggle('open');
  document.getElementById(`bch-${i}`).classList.toggle('open');
}

/* ── Library ── */
let currentLibSem = 'Sem 1';
function renderLibrary() {
  const se = document.getElementById('lib-sems');
  if (se && se.innerHTML === '') se.innerHTML = Object.keys(LIBRARY).map(s => `<button class="sem-btn${s === currentLibSem ? ' active' : ''}" onclick="setLibSem('${s}',this)">${s}</button>`).join('');
  renderBooks();
}
function setLibSem(sem, btn) {
  currentLibSem = sem;
  document.querySelectorAll('.sem-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderBooks();
}
function renderBooks() {
  const data = LIBRARY[currentLibSem];
  const de = document.getElementById('lib-desc'); if (de) de.textContent = data.desc;
  const el = document.getElementById('book-grid'); if (!el) return;
  el.innerHTML = data.books.map((b, i) => {
    const issued = state.issuedBooks.includes(`${currentLibSem}-${i}`);
    const ac = b.avail === 0 ? 'var(--red)' : b.avail <= 1 ? 'var(--amber)' : 'var(--green)';
    const tagBg = b.tag === 'Must Read' ? 'rgba(79,142,247,.12)' : b.tag === 'High Demand' ? 'rgba(245,158,11,.12)' : 'transparent';
    const tagC = b.tag === 'Must Read' ? 'var(--blue2)' : b.tag === 'High Demand' ? 'var(--amber)' : '';
    return `<div class="book-card">
      ${b.tag ? `<div class="book-corner-tag" style="background:${tagBg};color:${tagC}">${b.tag}</div>` : ''}
      <div class="book-cover">${b.icon}</div><div class="book-title">${esc(b.title)}</div><div class="book-author">${esc(b.author)}</div>
      <span class="tag tag-purple" style="font-size:9px">${esc(b.subj)}</span>
      <div class="book-avail" style="color:${ac}">${b.avail === 0 ? '❌' : b.avail <= 1 ? '⚠️' : '✓'} ${b.avail}/${b.total} available</div>
      <button class="book-issue-btn" onclick="issueBook(${i},'${currentLibSem}')" ${b.avail === 0 || issued ? 'disabled' : ''}>${issued ? '✓ Issued' : 'Issue from Library'}</button>
    </div>`;
  }).join('');
}
function issueBook(i, sem) {
  const key = `${sem}-${i}`;
  if (state.issuedBooks.includes(key)) return;
  state.issuedBooks.push(key);
  LIBRARY[sem].books[i].avail = Math.max(0, LIBRARY[sem].books[i].avail - 1);
  renderBooks(); showToast(`"${LIBRARY[sem].books[i].title}" issued ✓ Return in 14 days`, true);
}
