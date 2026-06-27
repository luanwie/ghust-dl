import { motion, useReducedMotion } from "motion/react"

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const r = useReducedMotion()
  return (
    <motion.div
      initial={r ? { opacity: 1 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  )
}

export default function DonatePage() {
  const chave = "000.000.000-00"

  return (
    <div className="px-5 py-12 max-w-md mx-auto">
      <FadeUp>
        <div className="text-center mb-6">
          <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-[12px] font-medium mb-3">
            ❤️ Contribuição voluntária
          </p>
          <h1 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-text-primary tracking-tight mb-2">
            Apoie o GHUST-DL
          </h1>
          <p className="text-text-secondary text-[15px] leading-relaxed">
            O site é gratuito. Se ele te ajudou a achar música pro próximo set, qualquer contribuição ajuda a manter o servidor rodando.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="glass rounded-2xl p-6 sm:p-8 text-center border-brand-gold/10 mb-5">
          <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-5 bg-white rounded-xl flex items-center justify-center">
            <div className="text-center">
              <span className="text-bg-base text-3xl font-bold">G</span>
              <p className="text-bg-base/50 text-[10px] mt-1">QR Code Pix</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 mb-3">
            <p className="text-text-muted text-[12px] mb-1">Chave Pix (CPF)</p>
            <p className="text-text-primary font-mono text-[15px] sm:text-base font-medium tracking-wider">{chave}</p>
          </div>

          <button onClick={() => navigator.clipboard.writeText(chave)} className="btn-gold w-full text-[15px]">
            Copiar chave Pix
          </button>

          <p className="text-text-muted text-[12px] mt-5">Vai pra hospedagem, cache e café do dev ☕</p>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="glass rounded-xl p-5">
          <h2 className="text-text-primary font-semibold text-[15px] mb-3">Pra onde vai o dinheiro</h2>
          <div className="space-y-2.5">
            {[
              "Servidor VPS 24h (~R$32/mês)",
              "Domínio do site (~R$4/mês)",
              "Disco pra cache de áudio",
              "Café pro desenvolvedor ☕",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-[14px] text-text-secondary">
                <span className="text-brand-gold mt-0.5 shrink-0">•</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  )
}
