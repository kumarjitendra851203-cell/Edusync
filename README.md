# EduSync Pro — SISTec GN Bhopal

Smart campus platform: PresenceIQ (face-count attendance), student attendance tracker, bus tracker,
AI notes summarizer, AI coach/chatbot, library, quizzes and placement board.

Built by Jitendra Kumar, Aditya Tiwari & Anuj Saru.

## Structure
```
index.html          markup only
css/style.css       all styles
js/                 scripts (loaded in the order listed in index.html)
api/claude.js       Vercel serverless proxy to the Anthropic API (keeps the key secret)
vercel.json         Vercel config
.env.example        environment variable template
```

## Deploy (GitHub → Vercel)
1. Create a GitHub repo and push this folder.
2. On vercel.com: **Add New → Project → Import** the repo. Framework preset: **Other**. No build command.
3. Project Settings → Environment Variables: add `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`). Redeploy.
4. Without the key the AI features automatically fall back to built-in demo replies.

## Local run
`npm i -g vercel && vercel dev` (needed for `/api/claude`), or `npx serve .` for static-only.

## Demo logins
See the credential box on the login screen (`USER_DB` in `js/data.js`). These are demo-only,
client-side credentials — replace with real authentication before real use.
