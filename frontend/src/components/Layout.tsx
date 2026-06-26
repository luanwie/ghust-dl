import { Outlet, Link, useLocation } from "react-router-dom"

export default function Layout() {
  const loc = useLocation()

  const nav = [
    { path: "/", label: "Buscar" },
    { path: "/queue", label: "Fila" },
    { path: "/donate", label: "Doar" },
  ]

  return (
    <div className="grain">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-gold/3 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl font-bold text-brand-gold">G</span>
            <span className="text-lg font-semibold text-text-primary">GHUST-DL</span>
          </Link>
          <nav className="flex gap-1">
            {nav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  loc.pathname === item.path
                    ? "bg-brand-gold/15 text-brand-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8 text-center text-sm text-text-secondary">
        <p>GHUST-DL • Música em alta qualidade para DJs • Pix contribuição voluntária</p>
      </footer>
    </div>
  )
}
