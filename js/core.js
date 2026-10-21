/* ═══════════ CORE: auth, navigation, toast, init ═══════════ */

function showToast(msg, ok = true) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${ok ? 'ok' : 'err'} on`;
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('on'), 2800);
}

/* ── Login hints ── */
function fillHint() {
  const role = document.getElementById('login-role').value;
  const users = USER_DB[role];
  document.getElementById('hint-title').textContent = role === 'teacher' ? '🔐 Teacher Login Credentials' : '🔐 Student Login Credentials';
  document.getElementById('hint-lines').innerHTML = users.map(u =>
    `<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)"><b style="color:var(--text)">${esc(u.name)}</b><br/>📧 ${esc(u.email)} &nbsp;|&nbsp; 🔑 ${esc(u.password)}</div>`
  ).join('');
}
function togglePwd() {
  const inp = document.getElementById('login-pass'), eye = document.getElementById('pwd-eye');
  if (inp.type === 'password') { inp.type = 'text'; eye.textContent = '🙈'; }
  else { inp.type = 'password'; eye.textContent = '👁️'; }
}
function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = '⚠️  ' + msg; el.style.display = 'block';
  el.style.animation = 'none'; setTimeout(() => { el.style.animation = 'fadeUp .3s ease'; }, 10);
}
function clearLoginError() { document.getElementById('login-error').style.display = 'none'; }
function getInitials(name) { return name.trim().split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join(''); }

function doLogin() {
  clearLoginError();
  const nameVal = document.getElementById('login-name').value.trim();
  const emailVal = document.getElementById('login-email').value.trim().toLowerCase();
  const passVal = document.getElementById('login-pass').value.trim();
  const role = document.getElementById('login-role').value || 'student';

  if (!nameVal) { showLoginError('Please enter your full name.'); return document.getElementById('login-name').focus(); }
  if (!emailVal) { showLoginError('Please enter your email address.'); return document.getElementById('login-email').focus(); }
  if (!passVal) { showLoginError('Please enter your password.'); return document.getElementById('login-pass').focus(); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { showLoginError('Please enter a valid email address.'); return document.getElementById('login-email').focus(); }

  const user = (USER_DB[role] || []).find(u => u.email === emailVal);
  if (!user) { showLoginError(`No ${role} account found with this email. Check credentials below.`); return document.getElementById('login-email').focus(); }
  if (user.name.toLowerCase() !== nameVal.toLowerCase()) { showLoginError(`Name does not match our records for this email. Expected: "${user.name}"`); return document.getElementById('login-name').focus(); }
  if (user.password !== passVal) { showLoginError('Incorrect password. Please try again.'); const p = document.getElementById('login-pass'); p.value = ''; return p.focus(); }

  state.role = role; state.userName = user.name; state.userInitials = getInitials(user.name);
  initDashboard(role);
  showScreen(role === 'teacher' ? 'teacher-app' : 'student-app');
  initApp();
  showToast(`✅ Welcome, ${user.name.split(' ')[0]}! Logged in as ${role}.`, true);
}
function doSkip() {
  clearLoginError();
  state.role = 'student'; state.userName = 'Guest Student'; state.userInitials = 'GS';
  initDashboard('student'); showScreen('student-app'); initApp();
  showToast('Browsing as Guest 👤', true);
}
function initDashboard(role) {
  const name = state.userName, initials = state.userInitials;
  const first = name.split(' ').filter(w => !w.startsWith('Prof'))[0] || name.split(' ')[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  if (role === 'student') {
    document.getElementById('student-avatar').textContent = initials;
    document.getElementById('s-greeting-name').textContent = `Hello, ${first} 👋`;
  } else {
    document.getElementById('teacher-avatar').textContent = initials;
    document.getElementById('t-greeting-name').textContent = `${greet}, ${name.replace('Prof. ', '')} 👋`;
  }
}
function logout() {
  stopFaceInterview(true);
  if (typeof stopInterview === 'function' && ivActive) stopInterview(true);
  showScreen('login'); clearLoginError(); state.role = null;
  ['login-name', 'login-email', 'login-pass'].forEach(id => { document.getElementById(id).value = ''; });
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ── Navigation (single source of truth) ── */
function switchPage(role, page, el) {
  const prefix = role === 'teacher' ? 't' : 's';
  document.querySelectorAll(`#${role}-app .page`).forEach(p => p.classList.remove('active'));
  document.getElementById(`${prefix}-${page}`)?.classList.add('active');
  document.querySelectorAll(`#${role}-nav .nav-item`).forEach(n => n.classList.remove('active'));
  el?.classList.add('active');
  if (role === 'student') {
    if (page === 'resources') renderStudentResources();
    if (page === 'quiz') { backToQuizList(); renderStudentQuizList(); }
    if (page === 'analytics') renderAnalytics();
    if (page === 'placement') {
      state.currentPlacementTier = 'high';
      document.querySelectorAll('#placement-filter-tabs .tab-pill').forEach((t, i) => { t.classList.toggle('active', i === 0); t.classList.toggle('blue', i === 0); });
      renderStudentPlacements();
    }
    if (page === 'library') renderLibrary();
    if (page === 'bus') renderBus();
    if (page === 'agent') renderAgentModes();
    if (page === 'interview') initInterviewPage();
    if (page === 'headcount') initStudentHeadcount();
  } else {
    if (page === 'resources') renderTeacherResources();
    if (page === 'placement') renderTeacherPlacements();
    if (page === 'quiz') renderTeacherResults();
    if (page === 'headcount') renderHeadcountPage();
  }
  document.querySelector('.screen.active .main')?.scrollTo(0, 0);
}
function navTo(pageId, navIdx) {
  const items = document.querySelectorAll('#student-nav .nav-item');
  switchPage('student', pageId.replace('s-', ''), items[navIdx]);
}

/* ── App init (after login) ── */
function initApp() {
  const ds = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  ['t-date', 's-date'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ds; });
  renderClassGrid('class-grid'); renderClassGrid('class-grid-a', 'a'); renderClassGrid('class-grid-b', 'b');
  renderTeacherResources(); renderTeacherResults(); renderTeacherPlacements(); renderHeadcountPage();
  initQuizBuilder(); renderStudentUpcoming(); updateTotals(); updateStudentStats();
  renderBus(); renderLibrary(); renderAgentModes();
}
