/* ═══════════ STUDENT PRESENCEIQ HUB: attendance, bus tracker, notes AI, chatbot, alerts ═══════════ */

function initStudentHeadcount() { renderAttendance(); initBusTracker(); renderPlacementAlerts(state._alertFilter || 'all'); }

function showHcTab(tab, el) {
  document.querySelectorAll('.hc-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.hc-tab-panel').forEach(p => { p.style.display = 'none'; });
  const panel = document.getElementById('hc-tab-' + tab);
  if (panel) { panel.style.display = tab === 'chatbot' ? 'flex' : 'block'; panel.style.animation = 'fadeUp .25s ease'; }
  if (tab === 'bustracker') startBusTrackerSim(); else stopBusTrackerSim();
  if (tab === 'alerts') renderPlacementAlerts(state._alertFilter || 'all');
}

/* ── 1. Attendance ── */
const attPct = s => Math.round(s.attended / s.classes * 100);
const attColor = p => p < 75 ? 'var(--red)' : p < 80 ? 'var(--amber)' : p < 90 ? 'var(--green)' : 'var(--teal)';
// classes still to attend (without missing any) to reach 75%:  A + x >= 0.75 (C + x)
const attNeeded = s => Math.max(0, Math.ceil(3 * s.classes - 4 * s.attended));

function renderAttendance() {
  const list = document.getElementById('att-subject-list'); if (!list) return;
  const pcts = ATT_DATA.map(attPct);
  document.getElementById('att-overall').textContent = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) + '%';
  document.getElementById('att-safe').textContent = pcts.filter(p => p >= 75).length;
  document.getElementById('att-low').textContent = pcts.filter(p => p < 75).length;
  list.innerHTML = ATT_DATA.map(s => {
    const p = attPct(s), c = attColor(p), need = attNeeded(s);
    const status = p >= 75 ? '<span class="att-status-chip" style="background:rgba(34,197,94,.12);color:var(--green)">Safe ✓</span>' : '<span class="att-status-chip" style="background:rgba(239,68,68,.1);color:var(--red)">Low ⚠</span>';
    return `<div class="att-row"><div style="flex:1"><div class="att-subj">${s.subj}</div>
      <div style="font-size:10px;color:var(--muted)">${s.attended}/${s.classes} classes attended</div>
      ${need > 0 ? `<div style="font-size:10px;color:var(--red);margin-top:2px">Attend next ${need} classes to reach 75%</div>` : ''}</div>
      <div class="att-bar-wrap"><div class="att-bar-fill" style="width:${p}%;background:${c}"></div></div>
      <div class="att-pct-num" style="color:${c}">${p}%</div>${status}</div>`;
  }).join('');
  const low = [...ATT_DATA].sort((a, b) => attPct(a) - attPct(b))[0], best = [...ATT_DATA].sort((a, b) => attPct(b) - attPct(a))[0];
  const ins = document.getElementById('att-ai-insight');
  if (ins) ins.innerHTML = attPct(low) < 75
    ? `<span style="color:var(--amber)">⚠️</span> Your ${low.subj} attendance is at <strong style="color:var(--red)">${attPct(low)}%</strong> — attend the next <strong style="color:var(--amber)">${attNeeded(low)} classes</strong> without a miss to reach the 75% minimum.<br/><br/><span style="color:var(--green)">✅</span> ${best.subj} <strong style="color:var(--green)">(${attPct(best)}%)</strong> is your strongest — keep it up!`
    : `<span style="color:var(--green)">✅</span> All subjects are above 75%. Best: ${best.subj} (${attPct(best)}%).`;
}
function refreshAttendance() { renderAttendance(); showToast('Showing demo data — connect your college portal for live attendance', true); }

/* ── 2. Bus tracker (simulated) ── */
let busSimInterval = null;
function initBusTracker() { updateBusTracker(); }
function updateBusTracker() {
  const data = BUS_TRACKER_DATA[document.getElementById('bt-route-select')?.value || '24']; if (!data) return;
  document.getElementById('bt-route-name').textContent = data.name;
  document.getElementById('bt-route-sub').textContent = `${data.stops.length} stops · Arrives at SISTec 8:15 AM`;
  document.getElementById('bt-eta').textContent = data.eta + ' min';
  document.getElementById('bt-speed').textContent = data.speed + ' km/h';
  document.getElementById('bt-stop').textContent = `Stop ${data.current + 1}/${data.stops.length}`;
  document.getElementById('bt-current-stop').textContent = data.stops[data.current] || '—';
  drawBusMapDots(data);
}
function drawBusMapDots(data) {
  const box = document.getElementById('bus-map-dots'); if (!box) return;
  const n = data.stops.length; box.innerHTML = '';
  const pos = data.stops.map((_, i) => ({ x: 20 + (i / Math.max(n - 1, 1)) * 160, y: 40 + Math.sin(i * 0.8) * 30 }));
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '200'); svg.setAttribute('height', '120'); svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%';
  for (let i = 0; i < pos.length - 1; i++) {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', pos[i].x); l.setAttribute('y1', pos[i].y); l.setAttribute('x2', pos[i + 1].x); l.setAttribute('y2', pos[i + 1].y);
    l.setAttribute('stroke', i < data.current ? '#2dd4bf' : 'rgba(255,255,255,0.15)'); l.setAttribute('stroke-width', '2');
    if (i >= data.current) l.setAttribute('stroke-dasharray', '4,4');
    svg.appendChild(l);
  }
  box.appendChild(svg);
  data.stops.forEach((stop, i) => {
    const cur = i === data.current, dot = document.createElement('div');
    dot.className = 'bus-map-dot' + (cur ? ' active' : '');
    dot.style.cssText = `left:${pos[i].x}px;top:${pos[i].y}px;background:${i < data.current ? '#2dd4bf' : cur ? '#4f8ef7' : 'rgba(255,255,255,.2)'};border:2px solid ${cur ? '#4f8ef7' : 'transparent'};width:${cur ? 14 : 8}px;height:${cur ? 14 : 8}px;`;
    const lbl = document.createElement('div');
    lbl.style.cssText = `position:absolute;top:16px;left:50%;transform:translateX(-50%);font-size:8px;color:${cur ? '#4f8ef7' : 'rgba(255,255,255,.5)'};white-space:nowrap;max-width:50px;overflow:hidden;text-overflow:ellipsis`;
    lbl.textContent = stop.replace('SISTec GN 🏫', 'SISTec');
    dot.appendChild(lbl); box.appendChild(dot);
  });
}
function startBusTrackerSim() {
  stopBusTrackerSim();
  busSimInterval = setInterval(() => {
    const data = BUS_TRACKER_DATA[document.getElementById('bt-route-select')?.value || '24']; if (!data) return;
    data.eta = Math.max(1, data.eta - (Math.random() > 0.7 ? 1 : 0));
    data.speed = Math.max(20, Math.min(60, data.speed + Math.floor(Math.random() * 7) - 3));
    document.getElementById('bus-last-updated').textContent = 'Demo simulation · ' + new Date().toLocaleTimeString();
    updateBusTracker();
  }, 4000);
}
function stopBusTrackerSim() { if (busSimInterval) { clearInterval(busSimInterval); busSimInterval = null; } }
function pingBusDriver() {
  showToast('📡 Ping sent to driver — response in a few seconds', true);
  setTimeout(() => showToast('✅ Driver confirmed: On schedule', true), 3000);
}

/* ── 3. Notes summarizer ── */
async function summarizeNotes() {
  const text = document.getElementById('notes-input').value.trim();
  if (text.length < 30) return showToast('Please paste at least 30 characters of notes', false);
  document.getElementById('notes-output').style.display = 'none';
  document.getElementById('notes-loading').style.display = 'block';
  document.getElementById('btn-summarize').disabled = true;
  let parsed;
  try {
    const raw = await callClaude({
      max_tokens: 1000,
      system: `You are a smart study assistant for engineering students at SISTec Bhopal.
Return ONLY valid JSON (no markdown, no code fences) in this exact shape:
{"summary":"3-4 sentence summary","flashcards":[{"q":"question","a":"answer"},{"q":"...","a":"..."},{"q":"...","a":"..."}],"topics":["topic1","topic2","topic3","topic4","topic5"]}`,
      messages: [{ role: 'user', content: `Analyze these student notes and respond with JSON only:\n\n${text.substring(0, 2000)}` }]
    });
    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (e) { parsed = localSummarize(text); }
  renderNotesSummary(parsed);
  document.getElementById('notes-loading').style.display = 'none';
  document.getElementById('notes-output').style.display = 'block';
  document.getElementById('btn-summarize').disabled = false;
}
function localSummarize(text) {
  const words = text.split(/\s+/), sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return {
    summary: sentences.slice(0, 3).join('. ').trim() + '.',
    flashcards: [
      { q: 'What is the main topic of these notes?', a: sentences[0]?.trim() || 'See notes above' },
      { q: 'What is the key concept discussed?', a: sentences[1]?.trim() || 'Review the material' },
      { q: 'Summarize a key point in your own words.', a: sentences[2]?.trim() || 'Practice recall' },
    ],
    topics: [...new Set(words.filter(w => w.length > 6).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean))].slice(0, 5)
  };
}
function renderNotesSummary(d) {
  document.getElementById('notes-summary').innerHTML = `<p style="margin:0">${esc(d.summary || 'Summary generated.')}</p>`;
  document.getElementById('notes-flashcards').innerHTML = (d.flashcards || []).map((fc, i) => `<div class="flashcard" onclick="this.classList.toggle('open')"><div class="flashcard-q">Q${i + 1}: ${esc(fc.q)}</div><div class="flashcard-a">💡 ${esc(fc.a)}</div></div>`).join('');
  document.getElementById('notes-topics').innerHTML = (d.topics || []).map(t => `<span class="tag tag-purple">${esc(t)}</span>`).join('');
}

/* ── 4. Campus chatbot ── */
const campusChatHistory = [];
function clearChatbot() {
  campusChatHistory.length = 0;
  document.getElementById('chatbot-messages').innerHTML = '<div class="cb-msg cb-ai"><div class="cb-bubble cb-ai-bubble">👋 Chat cleared! How can I help you today?</div></div>';
}
function quickChat(msg) { document.getElementById('chatbot-input').value = msg; sendChatMessage(); }
async function sendChatMessage() {
  const input = document.getElementById('chatbot-input'), msg = input.value.trim(); if (!msg) return;
  input.value = '';
  appendChatMsg('user', msg); campusChatHistory.push({ role: 'user', content: msg });
  const typingId = 'typing-' + Date.now(), msgsEl = document.getElementById('chatbot-messages');
  msgsEl.insertAdjacentHTML('beforeend', `<div class="cb-msg cb-ai" id="${typingId}"><div class="cb-typing"><div class="cb-dot"></div><div class="cb-dot"></div><div class="cb-dot"></div></div></div>`);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  let reply;
  try {
    reply = await callClaude({
      max_tokens: 600,
      system: `You are SISTec Campus AI, a helpful assistant for students at SISTec Gandhi Nagar, Bhopal (RGPV affiliated engineering college).
You know about: campus facilities, bus routes (24 Narela, 42 Karond, 11 Chhola, 12 Railway Station, etc. — all arrive 8:15 AM),
placement companies (Amazon ₹21L, Cisco, Deloitte, TCS, Infosys, Wipro, Accenture etc.), attendance rules (75% mandatory), library, labs, cafeteria, sports, hostels.
Be friendly, concise and helpful. Answer in 2-4 sentences max unless more detail is needed.`,
      messages: campusChatHistory.slice(-10)
    });
  } catch (e) { reply = getCampusAutoReply(msg); }
  document.getElementById(typingId)?.remove();
  appendChatMsg('ai', reply); campusChatHistory.push({ role: 'assistant', content: reply });
}
function appendChatMsg(role, text) {
  const el = document.getElementById('chatbot-messages'); if (!el) return;
  const div = document.createElement('div'); div.className = `cb-msg cb-${role}`;
  div.innerHTML = `<div class="cb-bubble cb-${role}-bubble">${esc(text).replace(/\n/g, '<br/>')}</div>`;
  el.appendChild(div); el.scrollTop = el.scrollHeight;
}
function getCampusAutoReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('attendance')) { const low = [...ATT_DATA].sort((a, b) => attPct(a) - attPct(b))[0]; return `📋 Your lowest attendance is ${low.subj} at ${attPct(low)}%. Attend the next ${attNeeded(low)} classes to reach the 75% minimum.`; }
  if (m.includes('bus') || m.includes('route')) return '🚌 All SISTec buses arrive at 8:15 AM. Bus 24 serves Narela, Bus 42/02/49 serves Karond (3 buses!), Bus 12 covers Railway Station. Transport Manager: 7987760314.';
  if (m.includes('placement') || m.includes('company') || m.includes('job')) return '💼 Top placements: Amazon (₹21L), Cisco (₹18L), Deloitte (₹12L). Average package is ₹4.5L. Mass hiring by TCS, Infosys, Wipro. Check the Placement Board for the latest drives!';
  if (m.includes('cgpa') || m.includes('marks') || m.includes('study')) return '📈 To improve CGPA: focus on DS, DBMS and OS, attempt all quizzes on EduSync, use the Notes Summarizer for revision and practise PYQs.';
  if (m.includes('library')) return '📚 The library has books for all 8 semesters. High-demand: CLRS, Galvin OS, Silberschatz DBMS. Issue books from the Library tab for 14 days.';
  if (m.includes('fee') || m.includes('hostel') || m.includes('mess')) return '🏠 For hostel, fees and mess queries, contact the administrative office at 0755-2577-777 or info@sistec.ac.in.';
  if (m.includes('wifi') || m.includes('internet')) return '📶 SISTec GN has high-speed Wi-Fi across campus. Ask the IT desk for your login details.';
  return '🤖 I can help with attendance, bus timings, placements, library, CGPA tips and campus queries. For urgent matters call 0755-2577-777.';
}

/* ── 5. Placement alerts ── */
function renderPlacementAlerts(filter) {
  state._alertFilter = filter;
  const box = document.getElementById('placement-alerts-list'); if (!box) return;
  let alerts = PLACEMENT_ALERTS;
  if (filter === 'urgent') alerts = alerts.filter(a => a.urgency === 'urgent');
  if (['drive', 'deadline', 'internship'].includes(filter)) alerts = alerts.filter(a => a.type === filter);
  const newCount = alerts.filter(a => a.isNew).length, badge = document.getElementById('alert-unread-count');
  if (badge) badge.textContent = newCount > 0 ? `● ${newCount} New` : '✓ All Read';
  if (!alerts.length) { box.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-txt">No alerts in this category</div></div>'; return; }
  box.innerHTML = alerts.map(a => {
    const tc = { urgent: 'var(--red)', drive: 'var(--blue2)', deadline: 'var(--amber)' }[a.urgency] || 'var(--teal)';
    return `<div class="alert-card alert-${a.urgency} ${a.isNew ? 'alert-new' : ''}">
      <div class="alert-company-row"><span class="alert-emoji">${a.emoji}</span>
        <div><div class="alert-company">${esc(a.company)}</div><div class="alert-role">${esc(a.role)} · Min CGPA ${a.cgpa}</div></div>
        <div style="margin-left:auto;font-family:'Outfit',sans-serif;font-size:16px;font-weight:800;color:var(--green)">${esc(a.pkg)}</div></div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:8px;line-height:1.6">${esc(a.desc)}</div>
      <div class="alert-tags">${a.skills.map(s => `<span class="tag" style="font-size:10px;padding:2px 8px">${esc(s)}</span>`).join('')}</div>
      <div class="alert-deadline-row"><div class="alert-time">⏰ Deadline: <strong style="color:${tc}">${esc(a.deadline)}</strong></div>
      <button class="alert-apply-btn" onclick="applyAlert(${a.id})">Apply Now →</button></div></div>`;
  }).join('');
}
function filterAlerts(filter, el) {
  document.querySelectorAll('#hc-tab-alerts .tab-pill').forEach(t => t.classList.remove('active', 'blue'));
  el.classList.add('active', 'blue'); renderPlacementAlerts(filter);
}
function applyAlert(id) {
  const a = PLACEMENT_ALERTS.find(x => x.id === id); if (!a) return;
  a.isNew = false; renderPlacementAlerts(state._alertFilter || 'all');
  showToast(`✅ Application started for ${a.company}!`, true);
}
function toggleAlertCheck(type, el) {
  el.classList.toggle('done'); el.textContent = el.classList.contains('done') ? '✓' : '';
  showToast(el.classList.contains('done') ? `${type[0].toUpperCase() + type.slice(1)} alerts enabled` : `${type} alerts disabled`, el.classList.contains('done'));
}
function subscribeAlerts() {
  document.querySelectorAll('#hc-tab-alerts .chk-circle').forEach(c => { c.classList.add('done'); c.textContent = '✓'; });
  showToast('🔔 Subscribed to all placement alerts!', true);
}
