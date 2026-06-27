import { useState, useCallback, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Link } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import ResultCard from "../components/ResultCard"
import { searchMusic, getStatus, formatSize } from "../lib/api"

/* ── Scroll-Reveal wrappers ── */
function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  )
}

function StaggerItem({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 40, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  )
}

/* ── Mouse glow ── */
function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || typeof window === "undefined") return
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

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(235,166,28,0.08) 0%, transparent 50%)",
      }}
    />
  )
}

/* ── BG Orbs ── */
function BgOrbs() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{ width: 520, height: 520, background: "rgba(235,166,28,0.04)", filter: "blur(100px)", top: "5%", left: "-10%" }}
        animate={{ x: [0, 40, -30, 20, 0], y: [0, -50, 30, -20, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 400, height: 400, background: "rgba(235,166,28,0.03)", filter: "blur(80px)", bottom: "10%", right: "-8%" }}
        animate={{ x: [0, -30, 40, -20, 0], y: [0, 40, -30, 20, 0], scale: [1, 0.92, 1.08, 0.96, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: 300, height: 300, background: "rgba(235,166,28,0.03)", filter: "blur(70px)", top: "50%", left: "50%", translateX: "-50%", translateY: "-50%" }}
        animate={{ x: [0, 50, -40, 30, 0], y: [0, -30, 50, -40, 0], scale: [1, 1.06, 0.94, 1.02, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  )
}

/* ── Stats pill ── */
function SystemPill() {
  const [stats, setStats] = useState<{ total_files: number; total_size_mb: number } | null>(null)

  useEffect(() => {
    getStatus().then((d) => {
      if (d?.cache) setStats(d.cache)
    }).catch(() => {})
  }, [])

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-text-muted">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
      {stats ? (
        <span>{stats.total_files} arquivos · {stats.total_size_mb}MB em cache</span>
      ) : (
        <span>Sistema pronto</span>
      )}
    </div>
  )
}

/* ── Steps ── */
const steps = [
  { icon: "01", title: "Busque", desc: "Digite o nome do artista ou música que você quer baixar." },
  { icon: "02", title: "Escolha", desc: "Veja resultados em FLAC ou MP3 320kbps de verdade." },
  { icon: "03", title: "Baixe", desc: "Download direto. Se já estiver em cache, é instantâneo." },
  { icon: "04", title: "Toque", desc: "Pronto pra rodar na cabine. Qualidade que passa no som do clube." },
]

/* ── Main page ── */
export default function HomePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const handleSearch = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    setQuery(q)
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
      <section className="section min-h-[85dvh] flex flex-col justify-center items-center text-center px-4 relative">
        <Section delay={0}>
          <div className="mb-6 flex justify-center">
            <SystemPill />
          </div>
        </Section>

        <Section delay={0.1}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-[1.05] mb-4 text-balance">
            Música pra DJ<br />
            <span className="text-brand-gold">em qualidade real</span>
          </h1>
        </Section>

        <Section delay={0.2}>
          <p className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            FLAC e MP3 320kbps verdadeiros via Soulseek. Cache inteligente.
            Gratuito com contribuição voluntária.
          </p>
        </Section>

        <Section delay={0.3} className="w-full max-w-xl mx-auto">
          <SearchBar onSearch={handleSearch} loading={loading} />
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" /> FLAC
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-brand-gold/80" /> MP3 320kbps
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-text-muted/80" /> Cache inteligente
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-text-muted/80" /> Pix voluntário
            </span>
          </div>
        </Section>
      </section>

      {/* ── Results ── */}
      {(loading || results.length > 0 || error || query) && (
        <section className="section px-4">
          <div className="max-w-3xl mx-auto">
            {loading && (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-3" />
                <p className="text-text-secondary text-sm">Buscando no Soulseek...</p>
              </div>
            )}

            {error && (
              <div className="glass rounded-xl p-6 border-red-500/20 text-center">
                <p className="text-red-400 font-medium">Erro na busca</p>
                <p className="text-text-secondary text-xs mt-1">{error}</p>
              </div>
            )}

            {!loading && !error && results.length === 0 && query && (
              <div className="text-center py-12">
                <p className="text-text-muted text-sm">Nenhum resultado para <span className="text-text-secondary font-medium">"{query}"</span></p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-text-muted">{results.length} resultado{results.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="space-y-2.5">
                  {results.map((r, i) => (
                    <ResultCard key={r.id || i} result={r} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      {!query && !loading && (
        <>
          <section className="section px-4">
            <div className="max-w-5xl mx-auto">
              <Section delay={0.1}>
                <div className="text-center mb-12">
                  <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-xs font-medium mb-4">
                    Como funciona
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Busca, baixa, toca
                  </h2>
                  <p className="text-text-secondary text-sm mt-3 max-w-md mx-auto">
                    Sem assinatura, sem limite, sem upscale falso.
                  </p>
                </div>
              </Section>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {steps.map((step, i) => (
                  <StaggerItem key={step.title} index={i}>
                    <div className="glass rounded-xl p-5 sm:p-6 gold-glow h-full">
                      <span className="text-[10px] font-bold text-brand-gold/50 tracking-wider">{step.icon}</span>
                      <h3 className="text-text-primary font-semibold text-base mt-2 mb-1.5">{step.title}</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section className="section px-4">
            <div className="max-w-5xl mx-auto">
              <Section delay={0.1}>
                <div className="text-center mb-12">
                  <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-xs font-medium mb-4">
                    Diferenciais
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Qualidade que faz diferença
                  </h2>
                </div>
              </Section>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  {
                    title: "FLAC real",
                    desc: "Sem upscale de YouTube. Áudio verdadeiro de 320kbps e FLAC extraído de fontes lossless.",
                    accent: "emerald",
                  },
                  {
                    title: "Cache inteligente",
                    desc: "Música já baixada por alguém? Seu download é instantâneo. O cache cresce com o uso.",
                    accent: "gold",
                  },
                  {
                    title: "Sem mensalidade",
                    desc: "Não tem plano nem assinatura. Contribua via Pix se quiser — qualquer valor ajuda.",
                    accent: "stone",
                  },
                  {
                    title: "Rede Soulseek",
                    desc: "Milhares de usuários compartilhando acervo real. Música que você não acha em lugar nenhum.",
                    accent: "gold",
                  },
                  {
                    title: "Pronto pra cabine",
                    desc: "MP3 320 é o padrão de clubes e festas. FLAC pra quem quer o máximo de fidelidade.",
                    accent: "emerald",
                  },
                  {
                    title: "Open source",
                    desc: "Código aberto no GitHub. Sem pegadinha, sem coleta de dados, sem surpresa.",
                    accent: "stone",
                  },
                ].map((f, i) => (
                  <StaggerItem key={f.title} index={i}>
                    <div className="glass rounded-xl p-5 gold-glow h-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-3 ${
                        f.accent === "gold"
                          ? "bg-brand-gold/12 text-brand-gold"
                          : f.accent === "emerald"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-text-muted"
                      }`}>
                        {i + 1}
                      </div>
                      <h3 className="text-text-primary font-semibold text-sm mb-1.5">{f.title}</h3>
                      <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="section px-4">
            <Section delay={0.1}>
              <div className="max-w-lg mx-auto glass rounded-2xl p-8 sm:p-10 text-center border-brand-gold/10">
                <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-xs font-medium mb-4">
                  ❤️ Contribua
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-3">
                  Gostou? Apoie o projeto
                </h2>
                <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                  GHUST-DL é gratuito. Se o servidor te ajudou a achar aquela música pro próximo set, qualquer contribuição ajuda a manter tudo online.
                </p>
                <Link to="/donate" className="btn-gold inline-flex px-8 py-4 text-base">
                  Fazer um Pix
                </Link>
              </div>
            </Section>
          </section>
        </>
      )}
    </>
  )
}
