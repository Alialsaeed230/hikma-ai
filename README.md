# Hikma AI | حكمة

A multilingual chat assistant for Shia Islamic knowledge, built on Ollama.

- `docs/` the website (static; this folder is what GitHub Pages serves)
- `main.py` the backend (FastAPI) that talks to Ollama
- `prompt.txt` the system prompt

## Run locally
```
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
Open http://localhost:8000 (needs `ollama signin` for the cloud model).

## GitHub Pages
Pages only hosts `docs/`. Run the backend somewhere with HTTPS, then set
`window.HIKMA_API` in `docs/js/config.js` and set `ALLOWED_ORIGIN` on the
backend to `https://YOUR-USER.github.io`.
