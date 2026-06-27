import { useState, useCallback } from "react"

interface Props {
  onSearch: (q: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("")

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim().length >= 2) onSearch(query.trim())
    },
    [query, onSearch],
  )

  return (
    <form onSubmit={submit}>
      <div className="flex items-center gap-2 glass rounded-xl sm:rounded-2xl p-1.5 focus-within:border-brand-gold/25 focus-within:shadow-[0_0_20px_rgba(235,166,28,0.05)] transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque artista, música, álbum..."
          className="flex-1 bg-transparent border-none outline-none px-4 py-3.5 sm:py-4 text-[16px] sm:text-[17px] text-text-primary placeholder:text-text-muted/50"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="btn-gold rounded-lg sm:rounded-xl px-5 sm:px-7 min-h-[48px] sm:min-h-[52px] text-[15px] font-semibold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
            </span>
          ) : (
            "Buscar"
          )}
        </button>
      </div>
    </form>
  )
}
