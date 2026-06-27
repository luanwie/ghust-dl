import { useState, useCallback, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Link } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import ResultCard from "../components/ResultCard"
import { searchMusic, getStatus } from "../lib/api"

/* ── Scroll Reveal ── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const r = useReducedMotion()
  return (
    <motion.div
      initial={r ? { opacity: 1 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  )
}

/* ── Mouse glow ── */
function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const handler = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${e.clientX}px`)
        el.style.setProperty("--my", `${e.clientY}px`)
      })
    }
    window.addEventListener("pointermove", handler)
    return () => { window.removeEventListener("pointermove", handler); cancelAnimationFrame(raf.current) }
  }, [reduce])
  return <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[60]" style={{ background: "radial-gradient(600px circle at var(--mx,50%) var(--my,50%),rgba(235,166,28,0.06) 0%,transparent 50%)" }} />
}

/* ── BgOrbs ── */
function BgOrbs() {
  const r = useReducedMotion()
  if (r) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div className="absolute rounded-full" style={{ width: 480, height: 480, background: "rgba(235,166,28,0.035)", filter: "blur(90px)", top: "3%", left: "-12%" }}
        animate={{ x: [0, 40, -30, 20, 0], y: [0, -50, 30, -20, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute rounded-full" style={{ width: 360, height: 360, background: "rgba(235,166,28,0.025)", filter: "blur(80px)", bottom: "8%", right: "-10%" }}
        animate={{ x: [0, -30, 40, -20, 0], y: [0, 40, -30, 20, 0], scale: [1, 0.92, 1.08, 0.96, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      <motion.div className="absolute rounded-full" style={{ width: 280, height: 280, background: "rgba(235,166,28,0.025)", filter: "blur(70px)", top: "50%", left: "50%", translateX: "-50%", translateY: "-50%" }}
        animate={{ x: [0, 50, -40, 30, 0], y: [0, -30, 50, -40, 0], scale: [1, 1.06, 0.94, 1.02, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
    </div>
  )
}

/* ── Status pill ── */
function StatusPill() {
  const [s, setS] = useState<string>("Sistema pronto")
  useEffect(() => {
    getStatus().then(d => {
      if (d?.cache?.total_files) setS(`${d.cache.total_files} músicas em cache`)
    }).catch(() => {})
  }, [])
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
      <span className="text-[12px] text-text-secondary font-medium">{s}</span>
    </div>
  )
}

const STEPS = [
  { num: "01", title: "Busque", desc: "Digite artista ou música. A busca varre a rede Soulseek em segundos." },
  { num: "02", title: "Escolha", desc: "Resultados em FLAC ou MP3 320kbps de verdade — sem upscale." },
  { num: "03", title: "Baixe", desc: "Se já estiver em cache, é instantâneo. Se não, baixa de um peer." },
  { num: "04", title: "Toque", desc: "Pronto pra rodar na cabine. Qualidade que passa no PA do clube." },
]

const FEATURES = [
  { num: "01", title: "FLAC e 320 reais", desc: "Sem upscale de YouTube. Áudio verdadeiro de fontes lossless." },
  { num: "02", title: "Cache inteligente", desc: "Música já baixada por alguém? Seu download sai em 1s." },
  { num: "03", title: "Sem mensalidade", desc: "Não tem plano nem assinatura. Contribua via Pix se quiser." },
  { num: "04", title: "Rede Soulseek", desc: "Milhares compartilhando acervo real. Música que não existe em lugar nenhum." },
  { num: "05", title: "Pronto pra cabine", desc: "MP3 320 é o padrão de clubes. FLAC pra quem quer o máximo." },
  { num: "06", title: "Código aberto", desc: "Sem pegadinha, sem coleta. O código tá no GitHub." },
]

export default function HomePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setQuery(q)
    setSearched(true)
    try {
      const data = await searchMusic(q)
      setResults(data.results || [])
    } catch (e: any) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <>
      <MouseGlow />
      <BgOrbs />

      {/* ── Hero ── */}
      <section className="min-h-[80dvh] flex flex-col justify-center px-5 py-16">
        <div className="max-w-xl mx-auto w-full">
          <Reveal>
            <div className="flex justify-center mb-5">
              <StatusPill />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] font-bold text-text-primary tracking-tight leading-[1.08] text-center mb-3 text-balance">
              Música pra DJ<br />
              <span className="text-brand-gold">em qualidade real</span>
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-text-secondary text-[15px] sm:text-[17px] leading-relaxed text-center max-w-md mx-auto mb-6">
              FLAC e MP3 320kbps verdadeiros. Cache inteligente. Gratuito com contribuição voluntária.
            </p>
          </Reveal>

          <Reveal delay={0.22}>
            <SearchBar onSearch={handleSearch} loading={loading} />
          </Reveal>

          <Reveal delay={0.28}>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-[13px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" /> FLAC
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/70" /> MP3 320
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/70" /> Cache
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/70" /> Pix ❤️
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Results ── */}
      {(loading || results.length > 0 || error || (searched && query)) && (
        <section className="px-5 pb-16">
          <div className="max-w-xl mx-auto">
            {loading && (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-6 h-6 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
                <p className="text-text-muted text-[14px]">Buscando no Soulseek...</p>
              </div>
            )}
            {error && (
              <div className="glass rounded-xl p-5 text-center border border-red-500/15">
                <p className="text-red-400 text-[14px] font-medium">Erro na busca</p>
                <p className="text-text-muted text-[13px] mt-1">{error}</p>
              </div>
            )}
            {!loading && !error && results.length === 0 && searched && query && (
              <div className="text-center py-10">
                <p className="text-text-muted text-[14px]">Nenhum resultado para <span className="text-text-secondary">"{query}"</span></p>
              </div>
            )}
            {!loading && results.length > 0 && (
              <>
                <p className="text-text-muted text-[13px] mb-3">{results.length} resultado{results.length !== 1 ? "s" : ""}</p>
                <div className="space-y-2.5">
                  {results.map((r, i) => <ResultCard key={r.id || i} result={r} />)}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Below-fold content (when no search) ── */}
      {!searched && (
        <>
          {/* How it works */}
          <section className="px-5 py-12 sm:py-16">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center mb-8 sm:mb-10">
                  <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-[12px] font-medium mb-3">
                    Como funciona
                  </p>
                  <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-text-primary tracking-tight">
                    Busca. Baixa. Toca.
                  </h2>
                </div>
              </Reveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="glass rounded-xl p-4 sm:p-5 gold-glow">
                    <span className="text-[10px] font-bold text-brand-gold/40 tracking-widest">{s.num}</span>
                    <h3 className="text-text-primary font-semibold text-[15px] mt-1.5 mb-1">{s.title}</h3>
                    <p className="text-text-muted text-[13px] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features grid */}
          <section className="px-5 py-12 sm:py-16">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-text-primary tracking-tight">
                    Por que usar?
                  </h2>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {FEATURES.map((f, i) => (
                  <div key={f.title} className="glass rounded-xl p-4 gold-glow">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold bg-brand-gold/10 text-brand-gold mb-2.5">{f.num}</div>
                    <h3 className="text-text-primary font-semibold text-[15px] mb-1">{f.title}</h3>
                    <p className="text-text-muted text-[13px] leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-5 py-12 sm:py-16">
            <Reveal>
              <div className="max-w-lg mx-auto glass rounded-2xl p-6 sm:p-8 text-center border-brand-gold/10">
                <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-[12px] font-medium mb-3">
                  ❤️ Contribuição voluntária
                </p>
                <h2 className="text-[1.5rem] font-bold text-text-primary tracking-tight mb-2">
                  Gostou? Apoie
                </h2>
                <p className="text-text-muted text-[14px] mb-5 max-w-xs mx-auto leading-relaxed">
                  Servidor, cache, domínio. Qualquer contribuição ajuda a manter o projeto online.
                </p>
                <Link to="/donate" className="btn-gold text-[15px] px-8">
                  Fazer um Pix
                </Link>
              </div>
            </Reveal>
          </section>
        </>
      )}
    </>
  )
}
