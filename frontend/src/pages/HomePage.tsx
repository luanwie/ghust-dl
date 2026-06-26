import { useState, useCallback } from "react"
import SearchBar from "../components/SearchBar"
import ResultCard from "../components/ResultCard"
import { searchMusic } from "../lib/api"

export default function HomePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [source, setSource] = useState("")

  const handleSearch = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setQuery(q)
    try {
      const data = await searchMusic(q)
      setResults(data.results || [])
      setSource(data.source || "soulseek")
    } catch (e: any) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Música em <span className="text-brand-gold">alta qualidade</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Busque faixas para baixar em MP3 320kbps ou FLAC.
          Gratuito com contribuição voluntária via Pix.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <SearchBar onSearch={handleSearch} loading={loading} />
        <div className="flex justify-center gap-4 mt-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> FLAC
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-gold" /> MP3 320kbps
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-text-secondary" /> Cache inteligente
          </span>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center text-text-secondary py-12">
          <div className="animate-pulse">Buscando no Soulseek...</div>
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto glass rounded-xl p-6 border-red-500/20 text-center">
          <p className="text-red-400 font-medium">Erro na busca</p>
          <p className="text-text-secondary text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div className="text-center text-text-secondary py-12">
          Nenhum resultado encontrado para "{query}"
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
              {source === "cache" && " (em cache)"}
            </p>
          </div>
          <div className="space-y-3">
            {results.map((r, i) => (
              <ResultCard key={r.id || i} result={r} isCached={r.cached} />
            ))}
          </div>
        </>
      )}

      {!query && !loading && (
        <div className="text-center text-text-secondary/40 py-16">
          <p className="text-6xl mb-4">🎧</p>
          <p>Digite um artista ou música para começar</p>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 mt-20">
        {[
          { title: "Qualidade real", desc: "MP3 320kbps e FLAC verdadeiros. Nada de upscale de YouTube.", icon: "🎵" },
          { title: "Cache inteligente", desc: "Músicas já baixadas ficam salvas. Próximo download é instantâneo.", icon: "⚡" },
          { title: "Sem assinatura", desc: "Contribua via Pix se quiser. Sem plano mensal, sem pegadinha.", icon: "❤️" },
        ].map((f) => (
          <div key={f.title} className="glass rounded-xl p-6 text-center">
            <span className="text-3xl mb-3 block">{f.icon}</span>
            <h3 className="text-text-primary font-semibold mb-2">{f.title}</h3>
            <p className="text-text-secondary text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
