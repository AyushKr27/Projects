# Chatbot Backend (Realtime + Grammar + Mood)

## Features
- Realtime chat via Socket.IO
- Spell autocorrect (nspell) + grammar suggestions (LanguageTool)
- Mood detection and mood-adaptive responses
- Short-term context store (Redis primary, in-memory fallback)
- Conversation persistence (SQLite for demo)
- Minimal client at `public/client.html`

## Quick start (local)
1. `git clone ...` and cd into folder
2. `cp .env.example .env` and edit if needed
3. `npm install`
4. `npm run dev`
5. Open `http://localhost:4000/client.html`

Optional:
- Run LanguageTool locally for grammar (recommended for heavy demo):
  `docker run -d --name languagetool -p 8010:8010 silviof/docker-languagetool`
  then set `LANGUAGETOOL_URL=http://localhost:8010/v2/check` in `.env`.

## Notes for final report
- Architecture diagram: NLU → Context Store → Dialog Manager → Socket IO → Client
- Evaluation: measure autocorrect accuracy and user satisfaction before/after mood-aware responses
- Privacy: avoid sending PII to external public APIs in production

