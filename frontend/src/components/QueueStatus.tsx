import { useState, useEffect, useCallback } from "react"
import { checkQueue, getFileUrl } from "../lib/api"

interface QueueStatusProps {
  taskId: string
}

export default function QueueStatus({ taskId }: QueueStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const poll = useCallback(async () => {
    try {
      const s = await checkQueue(taskId)
      setStatus(s)
      if (s.status === "completed" || s.status === "error" || s.status === "timeout") {
        return true
      }
      return false
    } catch (e: any) {
      setError(e.message)
      return true
    }
  }, [taskId])

  useEffect(() => {
    let cancelled = false
    const loop = async () => {
      for (let i = 0; i < 150; i++) {
        if (cancelled) return
        const done = await poll()
        if (done) return
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    loop()
    return () => { cancelled = true }
  }, [poll])

  if (error) return <div className="text-red-400 text-sm">Erro: {error}</div>

  if (!status) return <div className="text-text-secondary text-sm">Consultando...</div>

  if (status.status === "completed") {
    return (
      <div className="glass rounded-xl p-4 border-emerald-500/20">
        <p className="text-emerald-400 font-medium">✅ Download completo!</p>
        <a
          href={status.file_url}
          className="text-brand-gold underline text-sm mt-1 inline-block"
          target="_blank"
        >
          Baixar arquivo
        </a>
      </div>
    )
  }

  if (status.status === "error" || status.status === "timeout") {
    return (
      <div className="glass rounded-xl p-4 border-red-500/20">
        <p className="text-red-400 font-medium">
          ❌ {status.status === "timeout" ? "Tempo esgotado" : "Erro no download"}
        </p>
        {status.message && <p className="text-text-secondary text-sm mt-1">{status.message}</p>}
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-4">
      <p className="text-brand-gold font-medium">⬇️ Baixando do Soulseek...</p>
      <p className="text-text-secondary text-sm mt-1">
        {status.progress || "aguardando na fila"} — pode levar de 10s a 2min
      </p>
      <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gold rounded-full transition-all duration-500"
          style={{ width: status.progress === "queued" ? "5%" : status.progress || "20%" }}
        />
      </div>
    </div>
  )
}
