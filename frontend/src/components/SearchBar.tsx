import { useState, useCallback } from "react"

interface SearchBarProps {
  onSearch: (q: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim().length >= 2) onSearch(query.trim())
    },
    [query, onSearch],
  )

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="glass rounded-xl sm:rounded-2xl p-1.5 flex items-center gap-2 focus-within:border-brand-gold/25 focus-within:shadow-[0_0_24px_rgba(235,166,28,0.06)] transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque artista, música, álbum..."
          className="flex-1 bg-transparent border-none outline-none px-3 sm:px-4 py-3 sm:py-3.5 text-base sm:text-lg text-text-primary placeholder:text-text-muted/60"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="btn-gold rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 text-sm font-semibold disabled:opacity-40 min-h-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
              <span className="hidden sm:inline">Buscando</span>
            </span>
          ) : (
            "Buscar"
          )}
        </button>
      </div>
    </form>
  )
}
