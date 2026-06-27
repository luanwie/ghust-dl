"""
Updated wrapper for slskd REST API v0.25.x.
Based on slskd-python-api docs and actual endpoints.
"""
import httpx
import uuid
from typing import Optional
import time
import asyncio


class SlskdClient:
    def __init__(self, base_url: str = "http://localhost:5030", api_key: str = "",
                 username: str = "", password: str = ""):
        self.base_url = base_url.rstrip("/")
        self.api_url = f"{self.base_url}/api/v0"
        self.session = httpx.AsyncClient(timeout=30)

        if api_key:
            self.session.headers["X-API-Key"] = api_key
        elif username and password:
            self._auth_token = None
            self._username = username
            self._password = password
        else:
            self._username = ""
            self._password = ""

    async def _ensure_auth(self):
        """Login if using username/password auth."""
        if not self._username:
            return
        try:
            resp = await self.session.post(
                f"{self.api_url}/session",
                json={"username": self._username, "password": self._password},
            )
            if resp.status_code == 200:
                data = resp.json()
                self.session.headers["Authorization"] = f"Bearer {data.get('token', '')}"
        except Exception:
            pass

    async def search(self, query: str, limit: int = 50) -> list[dict]:
        """Search Soulseek. Returns list of results with files."""
        search_id = uuid.uuid4().hex
        resp = await self.session.post(
            f"{self.api_url}/searches",
            json={"searchText": query, "id": search_id},
        )
        resp.raise_for_status()

        # Wait for results to come in
        await asyncio.sleep(3)

        # Get search results
        resp = await self.session.get(f"{self.api_url}/searches/{search_id}")
        if resp.status_code == 404:
            return []
        resp.raise_for_status()
        data = resp.json()

        results = []
        responses = data.get("responses", [])
        for response in responses:
            username = response.get("username", "unknown")
            upload_speed = response.get("uploadSpeed", 0)
            for file in response.get("files", []):
                filename = file.get("filename", "")
                results.append({
                    "id": f"{username}::{filename}",
                    "filename": filename,
                    "size": file.get("size", 0),
                    "bitrate": self._describe_quality(file),
                    "format": self._guess_format(filename),
                    "username": username,
                    "speed": upload_speed,
                })

        # Sort: FLAC first, then high bitrate
        results.sort(key=lambda r: (
            0 if r["format"] == "FLAC" else 1 if "320" in r["bitrate"] else 2
        ))
        return results[:limit]

    def _describe_quality(self, file: dict) -> str:
        """Describe audio quality from file attributes."""
        br = file.get("bitRate", 0)
        bd = file.get("bitDepth", 0)
        sr = file.get("sampleRate", 0)
        ext = file.get("extension", "").lower()

        if ext == ".flac" and bd:
            return f"FLAC {bd}bit/{sr}kHz" if sr else "FLAC"
        if ext == ".flac":
            return "FLAC"
        if br >= 320:
            return "320kbps"
        if br >= 256:
            return "256kbps"
        if br >= 192:
            return "192kbps"
        return f"{br}kbps" if br else "desconhecido"

    def _guess_format(self, filename: str) -> str:
        f = filename.lower()
        if f.endswith(".flac"):
            return "FLAC"
        if f.endswith(".mp3"):
            return "MP3"
        if f.endswith(".wav"):
            return "WAV"
        if f.endswith((".m4a", ".aac")):
            return "AAC"
        if f.endswith(".ogg"):
            return "OGG"
        if f.endswith(".opus"):
            return "OPUS"
        return "desconhecido"

    async def enqueue(self, username: str, filename: str) -> dict:
        """Enqueue a file for download."""
        resp = await self.session.post(
            f"{self.api_url}/transfers/{username}",
            json={
                "filename": filename,
                "size": 0,  # slskd will resolve
            },
        )
        if resp.status_code == 409:
            # Already in queue, that's OK
            return {"status": "already_queued"}
        resp.raise_for_status()
        return resp.json()

    async def get_transfers(self) -> list[dict]:
        """Get download transfers."""
        resp = await self.session.get(f"{self.api_url}/transfers")
        if resp.status_code == 404:
            return []
        resp.raise_for_status()
        data = resp.json()
        # Flatten: transfers are grouped by username
        transfers = []
        if isinstance(data, list):
            for entry in data:
                username = entry.get("username", "")
                for d in entry.get("directories", []):
                    for f in d.get("files", []):
                        f["username"] = username
                        transfers.append(f)
        return transfers

    async def get_downloads(self) -> list[dict]:
        """Get completed downloads."""
        resp = await self.session.get(f"{self.api_url}/downloads")
        if resp.status_code == 404:
            return []
        resp.raise_for_status()
        return resp.json()

    async def wait_for_download(self, username: str, filename: str,
                                timeout: int = 300) -> Optional[str]:
        """Poll until download completes. Returns the file path or None."""
        start = time.time()
        while time.time() - start < timeout:
            transfers = await self.get_transfers()
            for t in transfers:
                if t.get("username") == username and filename in t.get("filename", ""):
                    state = t.get("state", "").lower()
                    if state in ("completed", "finished"):
                        return t.get("filename", "")
                    if state in ("errored", "cancelled", "rejected"):
                        return None
                    break
            await asyncio.sleep(2)
        return None

    async def health(self) -> bool:
        try:
            resp = await self.session.get(f"{self.api_url}/application", timeout=5)
            return resp.status_code < 500
        except Exception:
            return False

    async def close(self):
        await self.session.aclose()
