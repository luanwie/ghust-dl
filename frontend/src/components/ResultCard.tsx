import { useState } from "react"
import { formatSize, startDownload, getFileUrl } from "../lib/api"

interface Props {
  result: any
}

export default function ResultCard({ result }: Props) {
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

  const format = result.format || "—"
  const isFlac = format === "FLAC"
  const is320 = result.bitrate?.includes("320")
  const isCached = result.cached

  return (
    <div className="glass rounded-xl p-3.5 gold-glow">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-text-primary truncate leading-snug">{result.filename}</p>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className={`text-[12px] font-medium ${isFlac ? "text-emerald-400" : is320 ? "text-brand-gold" : "text-text-muted"}`}>
              {format}
            </span>
            <span className="text-[12px] text-text-muted">{formatSize(result.size)}</span>
            {isCached && <span className="text-[12px] text-emerald-400">✓ cache</span>}
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`shrink-0 min-w-[88px] min-h-[44px] px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
            done
              ? "bg-emerald-500/15 text-emerald-400"
              : downloading
                ? "bg-white/5 text-text-muted"
                : isCached
                  ? "bg-brand-gold/12 text-brand-gold hover:bg-brand-gold/20"
                  : "bg-white/8 text-text-primary hover:bg-white/12"
          }`}
        >
          {done ? "✓ Baixado" : downloading ? "..." : isCached ? "Baixar" : "Buscar"}
        </button>
      </div>
    </div>
  )
}
