/* ═══════════ AI BACKEND CLIENT ═══════════
   Calls the Vercel serverless proxy at /api/claude (API key stays server-side).
   Throws if the backend is unavailable so callers can fall back to demo/local logic. */
async function callClaude({ system = '', messages = [], max_tokens = 600 }) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, max_tokens })
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok || !data || !data.text) throw new Error((data && data.error) || 'AI unavailable');
  return data.text;
}

/* Escape user/AI text before inserting into innerHTML */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
