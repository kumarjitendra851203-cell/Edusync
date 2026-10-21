/* ═══════════ TEACHER: PresenceIQ, resources, quiz builder, placement ═══════════ */

/* ── Class grid ── */
function renderClassGrid(id, div = null) {
  const el = document.getElementById(id); if (!el) return;
  const list = div ? CLASSES[div] : [...CLASSES.a, ...CLASSES.b];
  el.innerHTML = list.map(cls => {
    const cnt = state.classData[cls];
    return `<div class="class-card${cnt !== undefined ? ' counted' : ''}" onclick="openCameraFor('${cls}')">
      <div class="class-name">${cls}</div>
      ${cnt !== undefined ? `<div class="class-cnt">${cnt}</div><div style="font-size:9px;color:var(--muted);margin-top:2px">students</div>` : '<div style="font-size:10px;color:var(--muted);margin-top:4px">Tap to count</div>'}
    </div>`;
  }).join('');
}
function updateTotals() {
  const vals = Object.values(state.classData);
  const total = vals.reduce((a, b) => a + b, 0);
  document.getElementById('t-total-count').textContent = total || '—';
  const el2 = document.getElementById('t-hc-total'); if (el2) el2.textContent = total || '—';
  const el3 = document.getElementById('t-hc-counted'); if (el3) el3.textContent = vals.length;
}
function refreshHeadcountViews() {
  renderClassGrid('class-grid'); renderClassGrid('class-grid-a', 'a'); renderClassGrid('class-grid-b', 'b');
  updateTotals(); renderHeadcountPage();
}
function renderHeadcountPage() {
  const el = document.getElementById('hc-log'); if (!el) return;
  if (!state.hcLog.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-txt">No captures yet</div></div>'; return; }
  el.innerHTML = state.hcLog.map(e => `<div class="result-row">
    <div><div class="result-label">Class ${esc(e.cls)}</div><div style="font-size:11px;color:var(--muted)">${esc(e.time)}</div></div>
    <div style="display:flex;align-items:center;gap:8px"><div class="result-val" style="color:var(--blue2)">${e.count}</div>
    <button class="btn btn-danger btn-sm" onclick="deleteHcEntry('${e.id}')">🗑</button></div></div>`).join('');
}
function deleteHcEntry(id) {
  const idx = state.hcLog.findIndex(e => e.id === id);
  if (idx < 0) return;
  const cls = state.hcLog[idx].cls;
  state.hcLog.splice(idx, 1); delete state.classData[cls];
  refreshHeadcountViews(); showToast(`${cls} entry deleted`, true);
}

/* ── Camera / PresenceIQ scanner ── */
let camStream = null, pendingCount = 0;
function openCamera() { openCameraFor(document.getElementById('camera-class').value || 'A1'); }
function openCameraFor(cls) {
  document.getElementById('camera-class').value = cls;
  document.getElementById('camera-modal').classList.add('open');
  resetCamUI();
}
function resetCamUI() {
  ['cam-video', 'cam-canvas'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.getElementById('cam-placeholder').style.display = 'flex';
  document.getElementById('cam-count-overlay').style.display = 'none';
  document.getElementById('rec-indicator').style.display = 'none';
  document.getElementById('cam-wrap').classList.remove('scanning');
  document.getElementById('cam-result-area').style.display = 'none';
  document.getElementById('btn-open-cam').style.display = 'inline-flex';
  document.getElementById('btn-upload-photo').style.display = 'inline-flex';
  ['btn-capture', 'btn-retake', 'btn-save'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.getElementById('cam-status').textContent = 'Tap Open Camera or Upload a Photo';
  ['hc-detection-metrics', 'hc-conf-bar', 'bbox-legend'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  const fi = document.getElementById('photo-file-input'); if (fi) fi.value = '';
}
function handlePhotoUpload(event) {
  const file = event.target.files[0]; if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Please select an image file', false);
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('cam-canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      document.getElementById('btn-open-cam').style.display = 'none';
      document.getElementById('btn-upload-photo').style.display = 'none';
      document.getElementById('cam-placeholder').style.display = 'none';
      canvas.style.display = 'block';
      document.getElementById('cam-wrap').classList.add('scanning');
      document.getElementById('cam-status').textContent = 'AI analysing uploaded photo…';
      setTimeout(() => analyzeFrame(canvas), 1200);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
async function openCameraStream() {
  try {
    document.getElementById('cam-status').textContent = 'Opening camera…';
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
    const vid = document.getElementById('cam-video');
    vid.srcObject = camStream; vid.style.display = 'block';
    document.getElementById('cam-placeholder').style.display = 'none';
    document.getElementById('rec-indicator').style.display = 'flex';
    document.getElementById('btn-open-cam').style.display = 'none';
    document.getElementById('btn-upload-photo').style.display = 'none';
    document.getElementById('btn-capture').style.display = 'inline-flex';
  } catch (e) {
    document.getElementById('cam-status').textContent = 'Camera blocked — upload a photo or use manual count below';
    document.getElementById('cam-result-area').style.display = 'block';
    document.getElementById('cam-result-num').textContent = '0';
    pendingCount = 0;
    document.getElementById('btn-open-cam').style.display = 'none';
    document.getElementById('btn-save').style.display = 'inline-flex';
    showToast('Allow camera in browser settings', false);
  }
}
function capturePhoto() {
  const vid = document.getElementById('cam-video'), canvas = document.getElementById('cam-canvas');
  canvas.width = vid.videoWidth || 640; canvas.height = vid.videoHeight || 480;
  canvas.getContext('2d').drawImage(vid, 0, 0, canvas.width, canvas.height);
  vid.style.display = 'none'; canvas.style.display = 'block';
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  document.getElementById('rec-indicator').style.display = 'none';
  document.getElementById('btn-capture').style.display = 'none';
  document.getElementById('cam-wrap').classList.add('scanning');
  document.getElementById('cam-status').textContent = 'AI detecting faces…';
  setTimeout(() => analyzeFrame(canvas), 1200);
}
function adjustCount(d) {
  pendingCount = Math.max(0, pendingCount + d);
  document.getElementById('cam-result-num').textContent = pendingCount;
  document.getElementById('cam-count-num').textContent = pendingCount;
  const hcDet = document.getElementById('hc-detected'); if (hcDet) hcDet.textContent = pendingCount;
}
function retakePhoto() { if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } resetCamUI(); }
function closeCamera() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  document.getElementById('camera-modal').classList.remove('open');
}
function saveHeadcount() {
  const cls = document.getElementById('camera-class').value;
  state.classData[cls] = pendingCount;
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  state.hcLog.unshift({ id: 'hc-' + Date.now(), cls, count: pendingCount, time });
  refreshHeadcountViews(); closeCamera();
  showToast(`${cls}: ${pendingCount} students saved ✓`, true);
}

function setDetectionMode(mode, el) {
  document.querySelectorAll('.det-mode-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.detectionThreshold = { classroom: 0.5, assembly: 0.35, crowd: 0.25 }[mode];
}

/* Face detection with bounding boxes + confidence (BlazeFace) */
async function analyzeFrame(canvas) {
  const ctx = canvas.getContext('2d');
  try {
    if (typeof blazeface === 'undefined') throw new Error('model library not loaded');
    if (!state.faceModel) {
      document.getElementById('cam-status').textContent = 'Loading AI model…';
      state.faceModel = await blazeface.load();
    }
    const off = document.createElement('canvas');
    const scale = Math.min(1, 640 / canvas.width);
    off.width = canvas.width * scale; off.height = canvas.height * scale;
    off.getContext('2d').drawImage(canvas, 0, 0, off.width, off.height);

    const threshold = state.detectionThreshold || 0.5;
    const predictions = await state.faceModel.estimateFaces(off, false);
    const valid = predictions.filter(p => (p.probability?.[0] ?? 1) >= threshold);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
    const sx = canvas.width / off.width, sy = canvas.height / off.height;

    valid.forEach((face, i) => {
      const [x1, y1] = face.topLeft, [x2, y2] = face.bottomRight;
      const conf = face.probability?.[0] ?? 0.85;
      const w = (x2 - x1) * sx, h = (y2 - y1) * sy, bx = x1 * sx, by = y1 * sy;
      const color = conf > 0.8 ? '#22c55e' : conf > 0.5 ? '#f59e0b' : '#ef4444';
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, canvas.width / 400);
      ctx.strokeRect(bx, by, w, h);
      ctx.fillStyle = color; ctx.font = `bold ${Math.max(11, canvas.width / 60)}px sans-serif`;
      ctx.fillText(`#${i + 1} ${Math.round(conf * 100)}%`, bx + 3, Math.max(12, by - 4));
    });

    const count = valid.length;
    const avgConf = count ? valid.reduce((a, p) => a + (p.probability?.[0] ?? 0.85), 0) / count : 0;
    const confPct = Math.round(avgConf * 100);

    pendingCount = count;
    document.getElementById('cam-count-num').textContent = count;
    document.getElementById('cam-count-overlay').style.display = 'block';
    document.getElementById('cam-wrap').classList.remove('scanning');
    document.getElementById('hc-detection-metrics').style.display = 'grid';
    document.getElementById('hc-detected').textContent = count;
    document.getElementById('hc-confidence-pct').textContent = confPct + '%';
    document.getElementById('hc-conf-bar').style.display = 'block';
    document.getElementById('hc-conf-fill').style.width = confPct + '%';
    document.getElementById('hc-conf-txt').textContent = confPct + '%';
    document.getElementById('bbox-legend').style.display = 'flex';
    document.getElementById('cam-result-area').style.display = 'block';
    document.getElementById('cam-result-num').textContent = count;
    document.getElementById('btn-retake').style.display = 'inline-flex';
    document.getElementById('btn-save').style.display = 'inline-flex';
    document.getElementById('cam-status').textContent = `${count} student${count !== 1 ? 's' : ''} detected (${confPct}% confidence)`;
  } catch (e) {
    console.error('Detection error:', e);
    // Model failed to load (offline / blocked CDN): let the teacher enter the count manually
    pendingCount = 0;
    document.getElementById('cam-wrap').classList.remove('scanning');
    document.getElementById('cam-result-area').style.display = 'block';
    document.getElementById('cam-result-num').textContent = 0;
    document.getElementById('btn-save').style.display = 'inline-flex';
    document.getElementById('btn-retake').style.display = 'inline-flex';
    document.getElementById('cam-status').textContent = 'Face model unavailable — adjust the count manually';
    showToast('AI model could not load — use manual count', false);
  }
}

/* ── Resources (teacher upload) ── */
let uploadType = 'pdf', selectedTeacherFile = null;
const rtypes = { pdf: { icon: '📄', cls: 'pdf' }, yt: { icon: '▶️', cls: 'yt' }, pyq: { icon: '📋', cls: 'pyq' }, assignment: { icon: '📝', cls: 'pdf' }, video: { icon: '🎥', cls: 'yt' } };

function setUploadType(type, el) {
  uploadType = type;
  document.querySelectorAll('.upload-type-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const fileZone = document.getElementById('file-upload-zone'), videoZone = document.getElementById('video-upload-zone');
  if (type === 'video') { fileZone.style.display = 'none'; videoZone.style.display = 'block'; return; }
  fileZone.style.display = 'block'; videoZone.style.display = 'none';
  const cfg = {
    pdf: { icon: '📄', title: 'Upload PDF / DOC / PPT', hint: 'Supports PDF, DOC, DOCX, PPT, PPTX (max 50MB)', accept: '.pdf,.doc,.docx,.ppt,.pptx' },
    assignment: { icon: '📝', title: 'Upload Assignment File', hint: 'Supports PDF, DOC, DOCX (max 20MB)', accept: '.pdf,.doc,.docx' },
    pyq: { icon: '📋', title: 'Upload PYQ Paper', hint: 'Supports PDF files only (max 20MB)', accept: '.pdf' },
  }[type];
  document.getElementById('dropzone-icon').textContent = cfg.icon;
  document.getElementById('dropzone-title').textContent = cfg.title;
  document.getElementById('dropzone-hint').textContent = cfg.hint;
  document.getElementById('teacher-file-input').accept = cfg.accept;
}
function handleTeacherFileSelect(e) { const f = e.target.files[0]; if (f) { selectedTeacherFile = f; showFileSelected(f); } }
function handleTeacherDrop(e) {
  e.preventDefault(); document.getElementById('teacher-dropzone').style.borderColor = '';
  const f = e.dataTransfer.files[0]; if (f) { selectedTeacherFile = f; showFileSelected(f); }
}
function showFileSelected(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const icons = { pdf: '📄', doc: '📘', docx: '📘', ppt: '📊', pptx: '📊' };
  document.getElementById('file-selected-info').style.display = 'block';
  document.getElementById('file-sel-icon').textContent = icons[ext] || '📁';
  document.getElementById('file-sel-name').textContent = file.name;
  document.getElementById('file-sel-size').textContent = formatFileSize(file.size);
}
function clearFileSelection() {
  selectedTeacherFile = null;
  document.getElementById('file-selected-info').style.display = 'none';
  document.getElementById('teacher-file-input').value = '';
}
function formatFileSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function teacherUpload() {
  const subject = document.getElementById('res-subject').value;
  const title = document.getElementById('res-title').value.trim();
  const semester = document.getElementById('res-semester').value || 'Sem 1';
  if (!title) return showToast('Please enter a title', false);

  if (uploadType === 'video') {
    const url = document.getElementById('res-video-url').value.trim();
    if (!/^https?:\/\//i.test(url)) return showToast('Please enter a valid video URL (https://…)', false);
    state.resources.unshift({ id: Date.now(), subject, title, type: 'yt', url, semester, size: 'Link', bookmarked: false, uploadedAt: new Date().toLocaleTimeString() });
    document.getElementById('res-video-url').value = ''; document.getElementById('res-title').value = '';
    renderTeacherResources(); return showToast(`Video "${title}" uploaded ✓`, true);
  }
  if (!selectedTeacherFile) return showToast('Please select a file first', false);

  // NOTE: demo only — the file is not stored anywhere. Wire this to Vercel Blob / Supabase / S3 for real uploads.
  const file = selectedTeacherFile;
  const btn = document.getElementById('btn-teacher-upload'), prog = document.getElementById('upload-progress');
  const bar = document.getElementById('upload-progress-bar'), txt = document.getElementById('upload-progress-txt');
  btn.disabled = true; prog.style.display = 'block'; txt.textContent = `Uploading "${file.name}"…`;
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.random() * 15 + 5;
    if (pct < 100) { bar.style.width = pct + '%'; return; }
    clearInterval(timer); bar.style.width = '100%'; txt.textContent = 'Upload complete! ✓';
    setTimeout(() => {
      prog.style.display = 'none'; bar.style.width = '0%'; btn.disabled = false;
      state.resources.unshift({ id: Date.now(), subject, title, type: uploadType, size: formatFileSize(file.size), filename: file.name, semester, bookmarked: false, uploadedAt: new Date().toLocaleTimeString() });
      clearFileSelection(); document.getElementById('res-title').value = '';
      renderTeacherResources(); showToast(`"${title}" uploaded successfully ✓`, true);
    }, 600);
  }, 120);
}
function renderTeacherResources() {
  const el = document.getElementById('t-resource-list'); if (!el) return;
  const filter = document.getElementById('filter-subject-teacher')?.value || '';
  const list = filter ? state.resources.filter(r => r.subject === filter) : state.resources;
  const cnt = document.getElementById('resource-count'); if (cnt) cnt.textContent = list.length;
  if (!list.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-txt">No resources yet. Upload your first material above!</div></div>'; return; }
  el.innerHTML = list.map(r => `<div class="resource-item-teacher">
    <div class="resource-file-icon" style="background:rgba(79,142,247,.1)">${rtypes[r.type]?.icon || '📄'}</div>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.title)}</div>
      <div style="font-size:11px;color:var(--muted)">${esc(r.subject)} · ${esc(r.size || 'Link')} ${r.semester ? '· ' + esc(r.semester) : ''}</div>
      ${r.uploadedAt ? `<div style="font-size:10px;color:var(--muted)">Uploaded at ${esc(r.uploadedAt)}</div>` : ''}
    </div>
    <div class="res-actions"><button class="btn btn-danger btn-sm" onclick="deleteResource(${r.id})">🗑</button></div>
  </div>`).join('');
}
function deleteResource(id) {
  const idx = state.resources.findIndex(r => r.id === id); if (idx < 0) return;
  const name = state.resources[idx].title; state.resources.splice(idx, 1);
  renderTeacherResources(); renderStudentResources(); showToast(`"${name}" deleted`, true);
}

/* ── Quiz builder ── */
let builderQuestions = [];
function initQuizBuilder() { builderQuestions = [{ q: '', options: ['', '', '', ''], correct: 0 }]; renderBuilderList(); }
function addQuestion() { builderQuestions.push({ q: '', options: ['', '', '', ''], correct: 0 }); renderBuilderList(); }
function renderBuilderList() {
  const el = document.getElementById('questions-list'); if (!el) return;
  el.innerHTML = builderQuestions.map((bq, qi) => `<div class="q-builder">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="font-size:11px;font-weight:700;color:var(--muted)">Q${qi + 1}</div>
      ${builderQuestions.length > 1 ? `<div class="icon-btn" onclick="removeQ(${qi})" style="color:var(--red)">✕</div>` : ''}
    </div>
    <input class="inp" placeholder="Question text…" value="${esc(bq.q)}" oninput="builderQuestions[${qi}].q=this.value"/>
    ${bq.options.map((opt, oi) => `<div class="opt-row">
      <div class="correct-dot${bq.correct === oi ? ' on' : ''}" onclick="setCorrect(${qi},${oi})"></div>
      <input class="inp" style="margin:0;flex:1" placeholder="Option ${oi + 1}" value="${esc(opt)}" oninput="builderQuestions[${qi}].options[${oi}]=this.value"/>
    </div>`).join('')}
  </div>`).join('');
}
function setCorrect(qi, oi) { builderQuestions[qi].correct = oi; renderBuilderList(); }
function removeQ(qi) { builderQuestions.splice(qi, 1); renderBuilderList(); }
function publishQuiz() {
  const title = document.getElementById('quiz-title-input').value.trim() || 'Untitled';
  const subject = document.getElementById('quiz-subject').value;
  const qs = builderQuestions.filter(q => q.q.trim() && q.options.every(o => o.trim()));
  if (!qs.length) return showToast('Add at least one complete question (text + 4 options)', false);
  state.quizzes.push({ id: Date.now(), title, subject, published: true, questions: qs.map(q => ({ ...q, options: [...q.options] })) });
  renderStudentQuizList(); renderStudentUpcoming(); renderTeacherResults();
  showToast(`"${title}" published!`, true);
  document.getElementById('quiz-title-input').value = ''; initQuizBuilder();
}
function renderTeacherResults() {
  const el = document.getElementById('t-results-list'); if (!el) return;
  if (!state.studentResults.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-txt">No submissions yet</div></div>'; return; }
  el.innerHTML = state.studentResults.map(r => `<div class="result-row">
    <div><div class="result-label">${esc(r.quizTitle)}</div><div style="font-size:11px;color:var(--muted)">${esc(r.time)}</div></div>
    <div><div class="result-val" style="color:var(--blue2)">${r.score}/${r.total}</div><div style="font-size:10px;color:var(--muted);text-align:right">${Math.round(r.score / r.total * 100)}%</div></div>
  </div>`).join('');
}

/* ── Placement posting ── */
function renderTeacherPlacements() {
  const el = document.getElementById('t-placement-list'); if (!el) return;
  el.innerHTML = state.placements.slice(0, 8).map(p => `<div class="placement-card" style="cursor:default">
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
      <div class="co-logo">${p.emoji}</div>
      <div><div class="co-name">${esc(p.company)}</div><div class="co-role">${esc(p.role)}</div></div>
      <div style="margin-left:auto"><div class="co-pkg" style="font-size:16px">${esc(p.package)}</div></div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${p.skills.map(s => `<span class="tag tag-blue">${esc(s)}</span>`).join('')}</div>
  </div>`).join('');
}
function postPlacement() {
  const company = document.getElementById('p-company').value.trim();
  if (!company) return showToast('Company name required', false);
  const role = document.getElementById('p-role').value.trim() || 'Engineer';
  const pkg = parseFloat(document.getElementById('p-package').value) || 0;
  const cgpa = parseFloat(document.getElementById('p-cgpa').value) || 7.0;
  const emojis = ['🔵', '🟩', '🟠', '🟣', '🔴'];
  state.placements.unshift({ id: Date.now(), company, emoji: emojis[Math.floor(Math.random() * emojis.length)], role, package: `₹${pkg} LPA`, pkgN: pkg, skills: ['Any Language'], cgpa, type: 'New Posting', tier: pkg >= 8 ? 'high' : pkg >= 4 ? 'avg' : 'mass' });
  renderTeacherPlacements(); showToast(`${company} posted ✓`, true);
  ['p-company', 'p-role', 'p-package', 'p-cgpa'].forEach(id => { document.getElementById(id).value = ''; });
}
