import json, os, time
from collections import defaultdict, deque
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BASE = Path(__file__).parent
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
MODEL = os.getenv("MODEL", "gemma4:31b-cloud")
ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGIN", "http://localhost:8000").split(",")]
RATE = int(os.getenv("RATE_PER_MIN", "20"))
PROMPT = (BASE / "prompt.txt").read_text(encoding="utf-8")
MARJAS = {"Sistani", "Khamenei", "Makarem Shirazi"}
MAX_MSGS, MAX_CHARS = 24, 6000

app = FastAPI(title="Hikma AI")
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["GET", "POST"], allow_headers=["*"])
hits = defaultdict(deque)


class Msg(BaseModel):
    role: str
    content: str


class Settings(BaseModel):
    marja: str = ""
    temperature: float = 0.4


class Req(BaseModel):
    messages: list[Msg]
    settings: Settings = Settings()


def limited(ip: str) -> bool:
    q, now = hits[ip], time.time()
    while q and now - q[0] > 60:
        q.popleft()
    q.append(now)
    return len(q) > RATE


@app.post("/chat")
async def chat(req: Req, request: Request):
    if limited(request.client.host if request.client else "x"):
        raise HTTPException(429, "Too many requests. Please wait a minute.")
    msgs = [{"role": m.role, "content": m.content[:MAX_CHARS]} for m in req.messages if m.role in ("user", "assistant") and m.content.strip()][-MAX_MSGS:]
    if not msgs or msgs[-1]["role"] != "user":
        raise HTTPException(400, "Last message must be from the user.")
    system = PROMPT
    if req.settings.marja in MARJAS:
        system += f"\n\nUSER CONTEXT\n- The user follows the rulings of {req.settings.marja}. For fiqh questions, give this marja's position first if you know it, and say clearly if you are unsure."
    payload = {"model": MODEL, "stream": True,
               "messages": [{"role": "system", "content": system}] + msgs,
               "options": {"temperature": min(max(req.settings.temperature, 0.0), 1.0)}}

    async def stream():
        try:
            async with httpx.AsyncClient(timeout=None) as c:
                async with c.stream("POST", OLLAMA_URL, json=payload) as r:
                    async for line in r.aiter_lines():
                        if line:
                            piece = json.loads(line).get("message", {}).get("content", "")
                            if piece:
                                yield piece
        except Exception:
            yield "\n[Error: the model is unavailable. Please try again.]"

    return StreamingResponse(stream(), media_type="text/plain; charset=utf-8")


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL}


# Serves the website (docs/) when running locally. Keep this last.
app.mount("/", StaticFiles(directory=BASE / "docs", html=True), name="site")
