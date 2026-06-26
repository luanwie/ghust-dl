const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function searchMusic(q: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}&limit=30`)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

export async function startDownload(filename: string, username: string): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/download?filename=${encodeURIComponent(filename)}&username=${encodeURIComponent(username)}`,
    { method: "POST" },
  )
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return res.json()
}

export async function checkQueue(taskId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/queue/${taskId}`)
  if (!res.ok) throw new Error("Task not found")
  return res.json()
}

export async function getStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/status`)
  return res.json()
}

export function getFileUrl(filename: string): string {
  return `${API_BASE}/api/files/${encodeURIComponent(filename)}`
}

export function formatSize(bytes: number): string {
  if (!bytes) return "—"
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}
