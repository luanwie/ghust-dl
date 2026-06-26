"""
Wrapper for slskd REST API.
https://github.com/slskd/slskd
"""
import httpx
from typing import Optional
import time
import asyncio


class SlskdClient:
    def __init__(self, base_url: str = "http://localhost:5030", username: str = "", password: str = ""):
        self.base_url = base_url.rstrip("/")
        self.auth = (username, password) if username and password else None
        self.client = httpx.AsyncClient(auth=self.auth, timeout=30)

    async def search(self, query: str, limit: int = 30) -> list[dict]:
        """Search Soulseek for files matching query."""
        resp = await self.client.get(f"{self.base_url}/api/search", params={
            "searchText": query,
            "limit": limit,
        })
        resp.raise_for_status()
        return self._parse_results(resp.json())

    def _parse_results(self, raw: list | dict) -> list[dict]:
        """Normalize slskd search results into a clean format."""
        results = []
        if isinstance(raw, dict):
            raw = raw.get("files", raw.get("results", [raw]))
        for item in raw:
            results.append({
                "id": item.get("id", ""),
                "filename": item.get("filename", ""),
                "size": item.get("size", 0),
                "bitrate": self._guess_bitrate(item.get("filename", "")),
                "format": self._guess_format(item.get("filename", "")),
                "username": item.get("username", item.get("user", "unknown")),
                "speed": item.get("uploadSpeed", item.get("speed", 0)),
            })
        return results

    def _guess_bitrate(self, filename: str) -> str:
        f = filename.lower()
        if ".flac" in f:
            return "FLAC"
        if "320" in f or "320kbps" in f:
            return "320kbps"
        if "v0" in f:
            return "V0 (~245kbps)"
        return "desconhecido"

    def _guess_format(self, filename: str) -> str:
        f = filename.lower()
        if f.endswith(".flac"):
            return "FLAC"
        if f.endswith(".mp3"):
            return "MP3"
        if f.endswith(".wav"):
            return "WAV"
        if f.endswith(".m4a") or f.endswith(".aac"):
            return "AAC"
        return "desconhecido"

    async def enqueue(self, username: str, filename: str) -> dict:
        """Enqueue a file for download from a specific user."""
        resp = await self.client.post(
            f"{self.base_url}/api/enqueue/{username}",
            json={"filename": filename},
        )
        resp.raise_for_status()
        return resp.json()

    async def get_transfers(self) -> list[dict]:
        """Get current download queue/transfers."""
        resp = await self.client.get(f"{self.base_url}/api/transfers")
        resp.raise_for_status()
        return resp.json()

    async def get_downloads(self) -> list[dict]:
        """Get completed downloads."""
        resp = await self.client.get(f"{self.base_url}/api/downloads")
        resp.raise_for_status()
        return resp.json()

    async def wait_for_download(self, username: str, filename: str, timeout: int = 300) -> Optional[str]:
        """Poll until download completes. Returns the file path or None."""
        start = time.time()
        while time.time() - start < timeout:
            transfers = await self.get_transfers()
            for t in transfers:
                if t.get("username") == username and filename in t.get("filename", ""):
                    if t.get("state", "").lower() == "completed":
                        return t.get("downloadPath") or t.get("filename")
                    break
            # Also check completed downloads
            downloads = await self.get_downloads()
            for d in downloads:
                if filename in d.get("filename", ""):
                    return d.get("path", d.get("filename"))
            await asyncio.sleep(2)
        return None

    async def health(self) -> bool:
        """Check if slskd is running."""
        try:
            resp = await self.client.get(f"{self.base_url}/api", timeout=5)
            return resp.status_code < 500
        except Exception:
            return False

    async def close(self):
        await self.client.aclose()
