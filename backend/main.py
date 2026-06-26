"""
GHUST-DL Backend — FastAPI application.
"""
import os
import uuid
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from slskd_client import SlskdClient
from cache_manager import CacheManager

load_dotenv()

# ── Config ──────────────────────────────────────────────────────
SLSKD_URL = os.getenv("SLSKD_URL", "http://localhost:5030")
SLSKD_USER = os.getenv("SLSKD_USERNAME", "")
SLSKD_PASS = os.getenv("SLSKD_PASSWORD", "")
CACHE_DIR = os.getenv("CACHE_DIR", os.path.join(os.path.dirname(__file__), "..", "cache"))

# ── Global state ─────────────────────────────────────────────────
slskd: SlskdClient = None
cache: CacheManager = None
download_queue: dict[str, dict] = {}  # task_id -> status


@asynccontextmanager
async def lifespan(app: FastAPI):
    global slskd, cache
    slskd = SlskdClient(SLSKD_URL, SLSKD_USER, SLSKD_PASS)
    cache = CacheManager(CACHE_DIR)
    yield
    await slskd.close()


app = FastAPI(title="GHUST-DL", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ────────────────────────────────────────────────────

@app.get("/api/search")
async def search(q: str = Query(min_length=2), limit: int = 30):
    """Search for music on Soulseek."""
    if not q or len(q.strip()) < 2:
        raise HTTPException(400, "Query must be at least 2 characters")

    # Check cache first
    cached = cache.get(q)
    if cached:
        return {
            "results": [{
                "id": f"cached-{cached['filename']}",
                "filename": cached["filename"],
                "size": cached["size"],
                "bitrate": cached["quality"],
                "format": cached["format"],
                "username": "[CACHE]",
                "cached": True,
            }],
            "source": "cache",
            "query": q,
        }

    # Search Soulseek
    try:
        results = await slskd.search(q, limit)
        # Prefer FLAC first, then high bitrate
        results.sort(key=lambda r: (
            0 if r["format"] == "FLAC" else 1 if r["bitrate"] == "320kbps" else 2
        ))
        return {"results": results, "source": "soulseek", "query": q}
    except Exception as e:
        raise HTTPException(502, f"Search failed: {str(e)}")


@app.post("/api/download")
async def download(filename: str = Query(...), username: str = Query(default="")):
    """Download a file. If cached, returns instantly."""
    task_id = uuid.uuid4().hex[:8]

    # Check cache again
    cached = cache.get(filename)
    if cached:
        path = cache.file_path(cached["filename"])
        if path:
            return {
                "task_id": task_id,
                "status": "completed",
                "file_url": f"/api/files/{cached['filename']}",
                "cached": True,
            }

    if not username:
        raise HTTPException(400, "username required for Soulseek download")

    # Enqueue on Soulseek
    try:
        await slskd.enqueue(username, filename)
    except Exception as e:
        raise HTTPException(502, f"Enqueue failed: {str(e)}")

    download_queue[task_id] = {"status": "downloading", "progress": "queued"}

    # Background poll
    async def poll_download():
        try:
            for _ in range(150):  # 5 min timeout
                transfers = await slskd.get_transfers()
                for t in transfers:
                    if t.get("username") == username and filename in t.get("filename", ""):
                        state = t.get("state", "").lower()
                        if state == "completed":
                            path = t.get("downloadPath", t.get("filename", ""))
                            if path:
                                quality = slskd._guess_bitrate(filename)
                                fmt = slskd._guess_format(filename)
                                cache.put(filename, path, quality, fmt)
                                cached_path = cache.get(filename)
                                if cached_path:
                                    download_queue[task_id] = {
                                        "status": "completed",
                                        "file_url": f"/api/files/{cached_path['filename']}",
                                    }
                                    return
                        elif state in ("errored", "cancelled"):
                            download_queue[task_id] = {"status": "error", "message": f"Transfer {state}"}
                            return
                        else:
                            progress = t.get("bytesTransferred", 0)
                            total = t.get("size", 1)
                            pct = round(progress / total * 100) if total else 0
                            download_queue[task_id] = {"status": "downloading", "progress": f"{pct}%"}
                await asyncio.sleep(2)
            download_queue[task_id] = {"status": "timeout"}
        except Exception as e:
            download_queue[task_id] = {"status": "error", "message": str(e)}

    asyncio.create_task(poll_download())

    return {
        "task_id": task_id,
        "status": "queued",
        "message": "Download started, check queue for status",
    }


@app.get("/api/queue/{task_id}")
async def queue_status(task_id: str):
    """Check download status."""
    status = download_queue.get(task_id)
    if not status:
        raise HTTPException(404, "Task not found")
    return status


@app.get("/api/files/{filename:path}")
async def serve_file(filename: str):
    """Serve a cached file."""
    path = cache.file_path(filename)
    if not path:
        raise HTTPException(404, "File not found")
    return FileResponse(path, media_type="audio/mpeg", filename=filename)


@app.get("/api/status")
async def status():
    """Health check."""
    slskd_ok = await slskd.health()
    cache_stats = cache.stats()
    return {
        "slskd": "online" if slskd_ok else "offline",
        "cache": cache_stats,
        "queue_pending": len([t for t in download_queue.values() if t["status"] not in ("completed", "error", "timeout")]),
    }


@app.get("/api/cache")
async def list_cache():
    """List all cached files."""
    return {"files": cache.list_cached(), "stats": cache.stats()}
