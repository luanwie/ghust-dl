import { formatSize, startDownload, getFileUrl } from "../lib/api"
import { useState } from "react"

interface ResultCardProps {
  result: any
  isCached?: boolean
}

export default function ResultCard({ result, isCached }: ResultCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)

  const handleDownload = async () => {
    if (isCached || result.cached) {
      window.open(getFileUrl(result.filename), "_blank")
      return
    }
    setDownloading(true)
    try {
      const data = await startDownload(result.filename, result.username)
      if (data.status === "completed") {
        window.open(data.file_url, "_blank")
        setDone(true)
      } else {
        // Redirect to queue page
        window.location.href = `/queue?task=${data.task_id}`
      }
    } catch {
      setDownloading(false)
    }
  }

  const qualityColor =
    result.format === "FLAC"
      ? "text-emerald-400"
      : result.bitrate?.includes("320")
        ? "text-brand-gold"
        : "text-text-secondary"

  return (
    <div className="glass rounded-xl p-4 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary truncate">{result.filename}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
            <span className={qualityColor}>{result.format || result.bitrate}</span>
            <span>{formatSize(result.size)}</span>
            {result.cached && <span className="text-emerald-400">✅ em cache</span>}
          </div>
          {!result.cached && (
            <p className="text-xs text-text-secondary mt-1">De: {result.username}</p>
          )}
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            done
              ? "bg-emerald-500/20 text-emerald-400"
              : downloading
                ? "bg-white/10 text-text-secondary"
                : "bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25"
          }`}
        >
          {done ? "Baixado" : downloading ? "..." : "Baixar"}
        </button>
      </div>
    </div>
  )
}
