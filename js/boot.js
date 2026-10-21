/* ═══════════ BOOT ═══════════ */
window.addEventListener('DOMContentLoaded', () => {
  fillHint();
  // Demo seed data
  state.studentResults = [
    { quizId: 1, quizTitle: 'Mid-Sem: Data Structures', score: 3, total: 4, accuracy: 75, time: '09:30', subject: 'Data Structures' },
    { quizId: 2, quizTitle: 'Quick Test: OS Basics', score: 1, total: 2, accuracy: 50, time: '11:15', subject: 'Operating Systems' },
  ];
  state.classData = { A1: 42, A2: 38, B1: 45, B3: 31 };
  state.hcLog = [
    { id: 'hc-3', cls: 'B1', count: 45, time: '09:30' },
    { id: 'hc-2', cls: 'A2', count: 38, time: '09:10' },
    { id: 'hc-1', cls: 'A1', count: 42, time: '08:45' },
  ];
  // Preload face model in the background
  if (typeof blazeface !== 'undefined') blazeface.load().then(m => { state.faceModel = m; }).catch(() => {});
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }
});
