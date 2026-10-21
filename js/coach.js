/* ═══════════ AI COACH (6 modes) ═══════════ */
let currentMode = null, chatHistory = [], chatLoading = false;

function renderAgentModes() {
  const el = document.getElementById('agent-mode-cards'); if (!el) return;
  el.innerHTML = AGENT_MODES.map(m => `<div class="agent-mode-card" onclick="startAgentChat('${m.id}')">
    <div class="agent-mode-emoji">${m.emoji}</div><div class="agent-mode-name">${m.name}</div><div class="agent-mode-desc">${m.desc}</div>
    <div class="agent-mode-cta" style="background:${m.color}18;color:${m.color}">${m.cta} →</div></div>`).join('');
  document.getElementById('agent-modes-view').style.display = 'block';
  document.getElementById('agent-chat-view').style.display = 'none';
}
function startAgentChat(modeId) {
  currentMode = AGENT_MODES.find(m => m.id === modeId);
  chatHistory = []; chatLoading = false;
  document.getElementById('agent-modes-view').style.display = 'none';
  const cv = document.getElementById('agent-chat-view');
  cv.style.display = 'block';
  cv.innerHTML = `<div class="chat-container visible" id="chat-inner">
    <div class="chat-header-bar">
      <button class="btn btn-ghost btn-sm" onclick="renderAgentModes()" style="flex-shrink:0">← Back</button>
      <div class="chat-ai-avatar">${currentMode.emoji}</div>
      <div><div class="chat-ai-name">${currentMode.name}</div><div class="chat-ai-status">Online — Ready to help</div></div>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="msg-wrap"><div class="msg-avatar ai">${currentMode.emoji}</div>
      <div class="msg-bubble ai">Hello! I'm your <strong>${currentMode.name}</strong>. I'm here for a real one-on-one session with you. Let's get started! 🚀<br/><br/>Type anything below or pick a quick starter:</div></div>
    </div>
    <div class="chat-input-area">
      <div class="quick-replies" id="quick-replies">${currentMode.starters.map((s, i) => `<div class="quick-reply" onclick="sendQuickReply(${i})">💬 ${esc(s)}</div>`).join('')}</div>
      <div class="chat-input-row"><textarea class="chat-textarea" id="chat-textarea" placeholder="Type your message… (Enter to send)" rows="1"></textarea>
      <button class="chat-send-btn" id="chat-send-btn" onclick="sendMsg()">➤</button></div>
    </div></div>`;
  const ta = document.getElementById('chat-textarea');
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; });
}
function sendQuickReply(i) {
  document.getElementById('chat-textarea').value = currentMode.starters[i];
  document.getElementById('quick-replies').style.display = 'none';
  sendMsg();
}
async function sendMsg() {
  const ta = document.getElementById('chat-textarea');
  const text = ta.value.trim(); if (!text || chatLoading) return;
  ta.value = ''; ta.style.height = 'auto';
  const qr = document.getElementById('quick-replies'); if (qr) qr.style.display = 'none';
  appendMsg('user', text); chatHistory.push({ role: 'user', content: text });
  chatLoading = true; document.getElementById('chat-send-btn').disabled = true;
  const typingId = 'typing-' + Date.now(); appendTyping(typingId);

  let reply;
  try {
    reply = await callClaude({ system: currentMode.system, messages: chatHistory, max_tokens: 600 });
  } catch (e) {
    // Backend not configured / offline → scripted demo reply
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    const turn = chatHistory.filter(m => m.role === 'user').length;
    const set = DEMO_SETS[currentMode.id] || [];
    reply = set[Math.min(turn - 1, set.length - 1)] || 'Demo mode: configure ANTHROPIC_API_KEY on the server for live AI replies.';
  }
  removeEl(typingId);
  chatHistory.push({ role: 'assistant', content: reply });
  appendMsg('ai', reply);
  chatLoading = false;
  const sb = document.getElementById('chat-send-btn'); if (sb) sb.disabled = false;
}
function appendMsg(role, text) {
  const msgs = document.getElementById('chat-messages'); if (!msgs) return;
  const initials = role === 'user' ? state.userInitials : currentMode.emoji;
  const html = esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
  const div = document.createElement('div');
  div.className = `msg-wrap${role === 'user' ? ' user' : ''}`;
  div.innerHTML = `<div class="msg-avatar ${role}">${esc(initials)}</div><div class="msg-bubble ${role}">${html}</div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}
function appendTyping(id) {
  const msgs = document.getElementById('chat-messages'); if (!msgs) return;
  const div = document.createElement('div'); div.id = id; div.className = 'msg-wrap';
  div.innerHTML = `<div class="msg-avatar ai">${currentMode.emoji}</div><div class="msg-bubble typing"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}
function removeEl(id) { document.getElementById(id)?.remove(); }
