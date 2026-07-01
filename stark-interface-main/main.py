from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import uvicorn
import asyncio
import json
from datetime import datetime

app = FastAPI(title="J.A.R.V.I.S API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "operational", "timestamp": datetime.utcnow().isoformat(), "services": {"openrouter": "configured", "backend": "online"}}

@app.get("/api/stream")
async def stream_endpoint():
    async def event_generator():
        while True:
            await asyncio.sleep(30)
            yield {"event": "ping", "data": json.dumps({"timestamp": datetime.utcnow().isoformat()})}
    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
