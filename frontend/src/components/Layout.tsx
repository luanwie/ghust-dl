import { Outlet, Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Layout() {
  const loc = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="relative min-h-dvh">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-elevated/90 backdrop-blur-xl border-b border-border-subtle"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="text-2xl font-bold text-brand-gold tracking-tight">G</span>
            <span className="text-base font-semibold text-text-primary tracking-tight">GHUST-DL</span>
          </Link>

          <nav className="flex items-center gap-1">
            {[
              { path: "/", label: "Buscar" },
              { path: "/queue", label: "Fila" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  loc.pathname === item.path
                    ? "bg-brand-gold/12 text-brand-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/donate"
              className="ml-2 btn-gold text-xs px-4 py-2 rounded-lg min-h-0 h-9"
            >
              Pix ❤️
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-20 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl font-bold text-brand-gold">G</span>
            <span className="text-sm font-semibold text-text-primary">GHUST-DL</span>
          </div>
          <p className="text-text-muted text-xs max-w-md mx-auto">
            Download de música em alta qualidade para DJs. Contribuição voluntária via Pix.
          </p>
          <p className="text-text-muted/50 text-[11px] mt-4">
            GHUST-DL &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
