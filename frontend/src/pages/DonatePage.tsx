import { motion, useReducedMotion } from "motion/react"

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  )
}

export default function DonatePage() {
  const chavePix = "000.000.000-00"

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <FadeUp>
        <div className="text-center mb-8">
          <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-xs font-medium mb-4">
            ❤️ Contribuição voluntária
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-3">
            Apoie o GHUST-DL
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
            O site é gratuito e não tem assinatura. Se ele te ajudou a encontrar aquela música que você ia tocar no próximo set, considere fazer um Pix. Qualquer valor ajuda a manter o servidor rodando.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <div className="glass rounded-2xl p-6 sm:p-8 text-center border-brand-gold/10 mb-6">
          {/* QR Placeholder */}
          <div className="w-40 h-40 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center">
            <div className="text-center">
              <span className="text-bg-base text-3xl font-bold">G</span>
              <p className="text-bg-base/50 text-[10px] mt-1">QR Code Pix</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="glass rounded-xl p-4">
              <p className="text-text-secondary text-[11px] mb-1">Chave Pix (CPF)</p>
              <p className="text-text-primary font-mono text-base font-medium tracking-wider">{chavePix}</p>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(chavePix)}
              className="btn-gold w-full"
            >
              Copiar chave Pix
            </button>
          </div>

          <p className="text-text-muted text-[11px] mt-6">
            Sua contribuição vai pra hospedagem do servidor e disco de cache.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="glass rounded-xl p-5 border-border-subtle">
          <h2 className="text-text-primary font-semibold text-sm mb-3">Pra onde vai o dinheiro</h2>
          <ul className="space-y-2 text-xs text-text-secondary">
            {[
              "Servidor VPS (~R$32/mês) — fica online 24h",
              "Domínio do site (~R$4/mês)",
              "Disco pra cache de áudio (cresce com o uso)",
              "Se sobrar, vira café pro desenvolvedor ☕",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </FadeUp>
    </div>
  )
}
