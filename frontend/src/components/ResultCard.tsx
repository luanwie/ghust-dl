import { formatSize, startDownload, getFileUrl } from "../lib/api"
import { useState } from "react"

interface ResultCardProps {
  result: any
}

export default function ResultCard({ result }: ResultCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)

  const handleDownload = async () => {
    if (result.cached) {
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
        : "text-text-muted"

  const isCached = result.cached

  return (
    <div className="glass rounded-xl p-3.5 sm:p-4 gold-glow">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary truncate">{result.filename}</p>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className={`text-[11px] font-medium ${qualityColor}`}>
              {result.format || result.bitrate}
            </span>
            <span className="text-[11px] text-text-muted">{formatSize(result.size)}</span>
            {isCached && <span className="text-[11px] text-emerald-400">✓ em cache</span>}
            {!isCached && result.username && (
              <span className="text-[11px] text-text-muted">{result.username}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`shrink-0 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all min-w-[80px] text-center ${
            done
              ? "bg-emerald-500/15 text-emerald-400"
              : downloading
                ? "bg-white/5 text-text-muted"
                : isCached
                  ? "bg-brand-gold/12 text-brand-gold hover:bg-brand-gold/20"
                  : "bg-white/8 text-text-primary hover:bg-white/12"
          }`}
        >
          {done ? "Baixado" : downloading ? "..." : isCached ? "Baixar" : "Buscar"}
        </button>
      </div>
    </div>
  )
}
