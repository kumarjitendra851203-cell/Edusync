// Vercel Serverless Function — proxies requests to the Anthropic API.
// The API key stays on the server (ANTHROPIC_API_KEY env var) and is never exposed to the browser.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI is not configured (missing ANTHROPIC_API_KEY)' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { system = '', messages = [], max_tokens = 600 } = body;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({ error: 'Invalid messages' });
    }
    const clean = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000)
    }));

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: Math.min(Number(max_tokens) || 600, 1200),
        system: String(system).slice(0, 4000),
        messages: clean
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data?.error?.message || 'Upstream error' });
    const text = (data.content || []).map(c => c.text || '').join('').trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
};
