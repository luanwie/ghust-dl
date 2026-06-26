"""
Cache management for downloaded music files.
"""
import os
import shutil
import hashlib
import json
import time
from pathlib import Path
from typing import Optional


class CacheManager:
    def __init__(self, cache_dir: str = "/cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.meta_file = self.cache_dir / "_metadata.json"
        self.metadata: dict = self._load_metadata()

    def _load_metadata(self) -> dict:
        if self.meta_file.exists():
            try:
                return json.loads(self.meta_file.read_text())
            except (json.JSONDecodeError, OSError):
                return {}
        return {}

    def _save_metadata(self):
        self.meta_file.write_text(json.dumps(self.metadata, indent=2))

    def _hash_key(self, query: str) -> str:
        return hashlib.md5(query.lower().strip().encode()).hexdigest()[:12]

    def get(self, search_query: str) -> Optional[dict]:
        """Check if a file is cached. Returns file info or None."""
        key = self._hash_key(search_query)
        if key in self.metadata:
            entry = self.metadata[key]
            path = self.cache_dir / entry["filename"]
            if path.exists():
                entry["path"] = str(path)
                return entry
            else:
                # File was deleted, clean metadata
                del self.metadata[key]
                self._save_metadata()
        return None

    def put(self, search_query: str, file_path: str, quality: str, format: str):
        """Register a cached file."""
        key = self._hash_key(search_query)
        src = Path(file_path)
        if not src.exists():
            return

        # Copy to cache with organized name
        ext = src.suffix
        clean_name = f"{key}{ext}"
        dest = self.cache_dir / clean_name

        if not dest.exists():
            shutil.copy2(src, dest)

        self.metadata[key] = {
            "filename": clean_name,
            "quality": quality,
            "format": format,
            "original_query": search_query,
            "cached_at": time.time(),
            "size": dest.stat().st_size,
        }
        self._save_metadata()

    def list_cached(self) -> list[dict]:
        """List all cached files."""
        result = []
        for key, entry in list(self.metadata.items()):
            path = self.cache_dir / entry["filename"]
            if path.exists():
                result.append({
                    "key": key,
                    "query": entry["original_query"],
                    "quality": entry["quality"],
                    "format": entry["format"],
                    "size": entry["size"],
                    "cached_at": entry["cached_at"],
                })
            else:
                del self.metadata[key]
        return sorted(result, key=lambda x: x["cached_at"], reverse=True)

    def stats(self) -> dict:
        """Get cache statistics."""
        files = self.list_cached()
        total_size = sum(f["size"] for f in files)
        return {
            "total_files": len(files),
            "total_size_mb": round(total_size / (1024 * 1024), 1),
            "qualities": {},
        }

    def file_path(self, filename: str) -> Optional[str]:
        """Get full path of a cached file by filename."""
        path = self.cache_dir / filename
        return str(path) if path.exists() else None
