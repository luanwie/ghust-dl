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
      <div className="glass rounded-2xl p-1 flex items-center gap-2 focus-within:border-brand-gold/30 focus-within:shadow-[0_0_30px_rgba(235,166,28,0.08)] transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque artista, música, álbum..."
          className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg text-text-primary placeholder:text-text-secondary/50"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="bg-brand-gold text-bg-base font-semibold px-6 py-3 rounded-xl disabled:opacity-40 transition-all hover:brightness-110 cursor-pointer"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>
    </form>
  )
}
