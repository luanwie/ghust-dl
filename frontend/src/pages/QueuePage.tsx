import { useSearchParams, Link } from "react-router-dom"
import QueueStatus from "../components/QueueStatus"

export default function QueuePage() {
  const [params] = useSearchParams()
  const taskId = params.get("task")

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-6">Fila de Downloads</h1>

      {taskId ? (
        <QueueStatus taskId={taskId} />
      ) : (
        <div className="text-center py-16">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center text-text-muted text-2xl">
            ⏳
          </div>
          <p className="text-text-secondary text-sm mb-1">Nenhum download em andamento</p>
          <p className="text-text-muted text-xs">
            Busque uma música na{" "}
            <Link to="/" className="text-brand-gold underline">página inicial</Link> pra começar.
          </p>
        </div>
      )}
    </div>
  )
}
