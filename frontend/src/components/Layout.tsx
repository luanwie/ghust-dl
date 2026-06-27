import { Outlet, Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const NAV = [
  { path: "/", label: "Buscar" },
  { path: "/queue", label: "Fila" },
  { path: "/donate", label: "Doar" },
]

export default function Layout() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [loc.pathname])

  return (
    <div className="relative min-h-dvh">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-bg-elevated/90 backdrop-blur-xl border-b border-border-subtle" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 sm:h-16 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2.5 no-underline z-10">
            <span className="text-2xl font-bold text-brand-gold tracking-tight">G</span>
            <span className="text-[15px] sm:text-base font-semibold text-text-primary tracking-tight">GHUST-DL</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.slice(0, 2).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] flex items-center ${
                  loc.pathname === item.path
                    ? "bg-brand-gold/12 text-brand-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/donate" className="ml-3 btn-gold text-sm px-5 py-2.5 rounded-lg min-h-[44px]">
              Pix ❤️
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden flex items-center justify-center w-11 h-11 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={() => setOpen(false)} />
          <div className="fixed top-0 right-0 z-50 w-64 h-full bg-bg-secondary border-l border-border-subtle pt-20 px-4 sm:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = loc.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all min-h-[52px] ${
                      active
                        ? "bg-brand-gold/12 text-brand-gold"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}

      {/* Content */}
      <main className="pt-14 sm:pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-16 py-8 px-5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl font-bold text-brand-gold">G</span>
            <span className="text-sm font-semibold text-text-primary">GHUST-DL</span>
          </div>
          <p className="text-text-muted text-[13px] max-w-xs mx-auto leading-relaxed">
            Download de música em alta qualidade para DJs. FLAC e MP3 320 reais. Contribuição voluntária via Pix.
          </p>
          <p className="text-text-muted/50 text-[11px] mt-4">&copy; {new Date().getFullYear()} GHUST-DL</p>
        </div>
      </footer>
    </div>
  )
}
