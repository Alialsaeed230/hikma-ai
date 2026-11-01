HIKMA AI - website

RUN
1. Install Python 3 and Ollama, then once:  ollama signin
2. Windows: double-click run.bat  |  Linux/Mac: ./run.sh
3. Open http://localhost:8000

FILES
prompt.txt            System prompt (edit any time, then restart)
main.py               FastAPI backend: /chat (streaming), /health, rate limit
docs/index.html       Page structure and icons
docs/css/style.css    All styling (light/dark, RTL, mobile)
docs/js/app.js        Chat app: history, settings, markdown, streaming
create_model.py       Optional: builds a "hikma-ai" model inside Ollama

SETTINGS FOR YOUR SERVER (environment variables)
MODEL=gemma4:31b-cloud   ALLOWED_ORIGIN=https://yourwebsite.com
RATE_PER_MIN=20          OLLAMA_URL=http://localhost:11434/api/chat

GOING PUBLIC
Use HTTPS (nginx or Caddy). Behind a proxy, run uvicorn with
--proxy-headers so rate limiting sees real IPs. Never expose port 11434.
Chats are saved in each visitor's own browser (localStorage), not on your server.
Fonts load from Google Fonts; self-host them if your server has no internet.

OTHER BACKEND HOSTS (Render, Railway, Fly.io, ...)
Start command:  python -m uvicorn main:app --host 0.0.0.0 --port $PORT
Environment variables:
  ALLOWED_ORIGIN=https://alialsaeed230.github.io
  OLLAMA_URL=https://ollama.com/api/chat      (call Ollama's cloud directly)
  OLLAMA_API_KEY=your key (set as a secret on the host, never commit it)
  MODEL=the cloud model name shown on ollama.com
