import { useSearchParams } from "react-router-dom"
import QueueStatus from "../components/QueueStatus"

export default function QueuePage() {
  const [params] = useSearchParams()
  const taskId = params.get("task")

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Fila de Downloads</h1>

      {taskId ? (
        <div className="max-w-lg mx-auto">
          <QueueStatus taskId={taskId} />
          <p className="text-text-secondary text-xs mt-4 text-center">
            A página atualiza automaticamente. Não feche enquanto o download não completar.
          </p>
        </div>
      ) : (
        <div className="text-center text-text-secondary/40 py-16">
          <p className="text-6xl mb-4">⏳</p>
          <p>Nenhum download em andamento.</p>
          <p className="text-sm mt-2">Busque uma música na página inicial para começar.</p>
        </div>
      )}
    </div>
  )
}
