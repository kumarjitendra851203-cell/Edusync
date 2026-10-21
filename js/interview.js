/* ═══════════ AI INTERVIEW LAB (voice + face) ═══════════ */
let ivMode = 'hr', ivActive = false, ivRecording = false, ivQuestionIdx = 0, ivRecognition = null, ivLog = [];
const ivSpeechSynth = window.speechSynthesis;

function setInterviewMode(mode, el) {
  ivMode = mode;
  document.querySelectorAll('.imode-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const face = mode === 'face';
  document.getElementById('voice-interview-ui').style.display = face ? 'none' : 'block';
  document.getElementById('face-interview-ui').style.display = face ? 'block' : 'none';
  if (face) { if (ivActive) stopInterview(true); } else stopFaceInterview(true);
}
function initInterviewPage() {
  ivActive = false; ivRecording = false; ivQuestionIdx = 0; ivLog = [];
  if (ivRecognition) { try { ivRecognition.abort(); } catch (e) {} }
}
function startVoiceInterview() {
  ivActive = true; ivQuestionIdx = 0; ivLog = [];
  document.getElementById('btn-start-interview').style.display = 'none';
  document.getElementById('interview-log').style.display = 'block';
  document.getElementById('iv-scores').style.display = 'flex';
  speakAndShowQuestion(IV_QUESTIONS[ivMode]?.[0] || 'Tell me about yourself.');
}
function pickEnglishVoice(utt) {
  const v = ivSpeechSynth.getVoices().find(v => v.lang.startsWith('en'));
  if (v) utt.voice = v;
}
function speakAndShowQuestion(question) {
  document.getElementById('iv-current-question').textContent = question;
  ivLog.push({ type: 'q', text: question }); updateInterviewLog();
  if (!ivSpeechSynth) return;
  ivSpeechSynth.cancel();
  const utt = new SpeechSynthesisUtterance(question);
  utt.rate = 0.95; pickEnglishVoice(utt);
  utt.onend = () => { if (ivActive) startVoiceRecognition(); };
  ivSpeechSynth.speak(utt);
}
function startVoiceRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { document.getElementById('iv-transcript').textContent = '⚠️ Voice recognition not supported in this browser (try Chrome).'; return; }
  ivRecognition = new SR();
  ivRecognition.continuous = false; ivRecognition.interimResults = true; ivRecognition.lang = 'en-IN';
  document.getElementById('btn-iv-record').classList.add('listening');
  activateVoiceBars(true);
  document.getElementById('iv-transcript').textContent = '🎤 Listening… speak your answer';
  ivRecognition.onresult = e => {
    let interim = '', fin = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) fin += e.results[i][0].transcript; else interim += e.results[i][0].transcript;
    }
    document.getElementById('iv-transcript').textContent = fin || interim;
    if (fin) processVoiceAnswer(fin);
  };
  const done = () => { activateVoiceBars(false); document.getElementById('btn-iv-record').classList.remove('listening'); ivRecording = false; };
  ivRecognition.onerror = done; ivRecognition.onend = done;
  try { ivRecognition.start(); ivRecording = true; } catch (e) { done(); }
}
function toggleVoiceRecord() {
  if (!ivActive) return showToast('Click "Start Interview" first', false);
  if (ivRecording) { try { ivRecognition.stop(); } catch (e) {} ivRecording = false; activateVoiceBars(false); document.getElementById('btn-iv-record').classList.remove('listening'); }
  else startVoiceRecognition();
}
/* NOTE: scores below are heuristic placeholders (word count + randomness), not real speech analysis. */
function processVoiceAnswer(answer) {
  ivRecording = false; activateVoiceBars(false);
  ivLog.push({ type: 'a', text: answer });
  const words = answer.trim().split(/\s+/).length;
  document.getElementById('iv-confidence').textContent = Math.min(95, 40 + words * 2 + Math.floor(Math.random() * 15)) + '%';
  document.getElementById('iv-clarity').textContent = Math.min(95, 45 + Math.floor(Math.random() * 35)) + '%';
  document.getElementById('iv-relevance').textContent = Math.min(95, 50 + Math.floor(Math.random() * 30)) + '%';
  const feedbacks = ['Good answer! Try to be more specific with examples.', 'Strong response. Your clarity was excellent.', 'Good structure. Consider adding quantifiable achievements.', 'Confident delivery. Connect it better to the role.', 'Well articulated! Use the STAR method for behavioral questions.'];
  const fb = feedbacks[Math.floor(Math.random() * feedbacks.length)];
  ivLog.push({ type: 'fb', text: 'AI Feedback: ' + fb }); updateInterviewLog();
  if (ivSpeechSynth) { ivSpeechSynth.cancel(); const u = new SpeechSynthesisUtterance(fb); pickEnglishVoice(u); ivSpeechSynth.speak(u); }
}
function nextInterviewQ() {
  if (!ivActive) return showToast('Start the interview first', false);
  const qs = IV_QUESTIONS[ivMode] || IV_QUESTIONS.hr;
  ivQuestionIdx = (ivQuestionIdx + 1) % qs.length;
  if (ivRecognition) { try { ivRecognition.abort(); } catch (e) {} }
  speakAndShowQuestion(qs[ivQuestionIdx]);
}
function stopInterview(silent) {
  ivActive = false; ivRecording = false;
  if (ivRecognition) { try { ivRecognition.abort(); } catch (e) {} }
  if (ivSpeechSynth) ivSpeechSynth.cancel();
  activateVoiceBars(false);
  document.getElementById('btn-iv-record').classList.remove('listening');
  document.getElementById('iv-current-question').textContent = 'Interview ended. Click "Start Interview" to begin again.';
  document.getElementById('iv-transcript').textContent = '';
  document.getElementById('btn-start-interview').style.display = 'block';
  if (silent !== true) showToast('Interview session ended', true);
}
function updateInterviewLog() {
  const log = document.getElementById('interview-log'); if (!log) return;
  log.innerHTML = ivLog.slice(-12).map(e => `<div class="log-${e.type}">${e.type === 'q' ? 'Q: ' : e.type === 'a' ? 'You: ' : ''}${esc(e.text)}</div>`).join('');
  log.scrollTop = log.scrollHeight;
}
function activateVoiceBars(on) { document.querySelectorAll('.voice-bar').forEach(b => b.classList.toggle('active', on)); }

/* ── Face interview ── */
let faceStream = null, faceInterval = null, faceActive = false, faceQIdx = 0, faceQTimer = null;

async function startFaceInterview() {
  try {
    faceStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    const vid = document.getElementById('face-video');
    vid.srcObject = faceStream; vid.style.display = 'block';
    document.getElementById('face-score-bar').style.display = 'block';
    document.getElementById('btn-face-start').style.display = 'none';
    document.getElementById('btn-face-stop').style.display = 'inline-flex';
    faceActive = true; faceQIdx = 0;
    document.getElementById('face-current-q').textContent = FACE_QUESTIONS[0];
    if (!state.faceModel && typeof blazeface !== 'undefined') state.faceModel = await blazeface.load();
    faceInterval = setInterval(analyzeFaceInterview, 1200);
    faceQTimer = setTimeout(cycleFaceQuestion, 10000);
  } catch (e) {
    showToast('Camera access required for Face Interview', false);
    document.getElementById('face-current-q').textContent = '⚠️ Camera blocked. Please allow camera access in browser settings.';
  }
}
/* NOTE: eye-contact is approximated from face centering; emotion percentages are illustrative, not a real emotion model. */
async function analyzeFaceInterview() {
  if (!faceActive || !state.faceModel) return;
  const vid = document.getElementById('face-video');
  if (vid.readyState < 2) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth || 320; canvas.height = vid.videoHeight || 240;
    canvas.getContext('2d').drawImage(vid, 0, 0, canvas.width, canvas.height);
    const predictions = await state.faceModel.estimateFaces(canvas, false);
    const fc = document.getElementById('face-canvas'), fctx = fc.getContext('2d');
    fc.width = vid.offsetWidth || 320; fc.height = vid.offsetHeight || 240;
    fctx.clearRect(0, 0, fc.width, fc.height);
    const chips = document.getElementById('face-overlay-stats');
    if (!predictions.length) { chips.innerHTML = '<div class="face-stat-chip" style="color:var(--amber)">⚠️ No face detected</div>'; return; }
    const face = predictions[0], conf = face.probability?.[0] ?? 0.85;
    const [x1, y1] = face.topLeft, [x2, y2] = face.bottomRight;
    const sx = fc.width / canvas.width, sy = fc.height / canvas.height;
    fctx.strokeStyle = '#2dd4bf'; fctx.lineWidth = 2;
    fctx.strokeRect(x1 * sx, y1 * sy, (x2 - x1) * sx, (y2 - y1) * sy);
    const cx = (x1 + x2) / 2 / canvas.width;
    const eye = Math.round(Math.max(0, 100 - Math.abs(cx - 0.5) * 200));
    const confidence = Math.round(55 + conf * 35 + Math.random() * 10);
    const nervous = Math.max(0, 100 - confidence - Math.floor(Math.random() * 20));
    const neutral = Math.max(0, 100 - Math.min(confidence, 70) - Math.min(nervous, 30));
    document.getElementById('face-eye').textContent = eye + '%';
    document.getElementById('face-conf').textContent = confidence + '%';
    document.getElementById('face-engage').textContent = Math.round((eye + confidence) / 2) + '%';
    document.getElementById('em-confident').textContent = confidence + '%';
    document.getElementById('em-neutral').textContent = neutral + '%';
    document.getElementById('em-nervous').textContent = nervous + '%';
    chips.innerHTML = `<div class="face-stat-chip" style="color:var(--teal)">👁 ${eye}% eye contact</div><div class="face-stat-chip" style="color:var(--blue2)">💪 ${confidence}% confident</div>`;
  } catch (e) {}
}
function cycleFaceQuestion() {
  if (!faceActive) return;
  faceQIdx = (faceQIdx + 1) % FACE_QUESTIONS.length;
  document.getElementById('face-current-q').textContent = FACE_QUESTIONS[faceQIdx];
  faceQTimer = setTimeout(cycleFaceQuestion, 10000);
}
function stopFaceInterview(silent) {
  const wasActive = faceActive;
  faceActive = false;
  clearInterval(faceInterval); faceInterval = null;
  clearTimeout(faceQTimer); faceQTimer = null;
  if (faceStream) { faceStream.getTracks().forEach(t => t.stop()); faceStream = null; }
  const vid = document.getElementById('face-video');
  if (vid) { vid.srcObject = null; vid.style.display = 'none'; }
  const stopBtn = document.getElementById('btn-face-stop'); if (stopBtn) stopBtn.style.display = 'none';
  const startBtn = document.getElementById('btn-face-start'); if (startBtn) startBtn.style.display = 'block';
  if (wasActive && silent !== true) showToast('Face Interview session ended', true);
}
