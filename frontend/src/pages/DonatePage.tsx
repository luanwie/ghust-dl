import { motion, useReducedMotion } from "motion/react"
import { Heart, Coffee, Server, Globe, HardDrive } from "lucide-react"
import { useState } from "react"

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
  const chave = "0fed2417-3df5-41ff-aae1-1f9e928e9bbd"
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chave)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="py-12 max-w-md mx-auto">
      <FadeUp>
        <div className="text-center mb-8">
          <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/8 border border-brand-gold/15 text-brand-gold text-[12px] font-medium mb-3">
            <Heart size={13} /> Contribuição voluntária
          </p>
          <h1 className="text-[1.75rem] sm:text-[2.25rem] font-bold text-text-primary tracking-tight mb-2">
            Apoie o GHUST-DL
          </h1>
          <p className="text-text-secondary text-[16px] leading-relaxed">
            O site é gratuito. Se ele te ajudou a achar música pro próximo set, qualquer contribuição ajuda a manter o servidor rodando.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="glass rounded-2xl p-6 sm:p-8 text-center border-brand-gold/10 mb-8">
          {/* QR placeholder */}
          <div className="w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center">
            <div className="text-center">
              <span className="text-bg-base text-3xl font-bold">G</span>
              <p className="text-bg-base/50 text-[10px] mt-1">QR Code Pix</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 mb-4">
            <p className="text-text-muted text-[12px] mb-1">Chave Pix (aleatória)</p>
            <p className="text-text-primary font-mono text-[15px] sm:text-base font-medium tracking-wider break-all">{chave}</p>
          </div>

          <button onClick={handleCopy} className="btn-gold w-full text-[15px] gap-2">
            {copied ? "Copiado!" : (
              <span className="flex items-center gap-2"><Heart size={18} /> Copiar chave Pix</span>
            )}
          </button>

          <p className="text-text-muted text-[12px] mt-5 flex items-center justify-center gap-1.5">
            Vai pra hospedagem, cache e <Coffee size={13} />
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="glass rounded-xl p-5 sm:p-6">
          <h2 className="text-text-primary font-semibold text-[16px] mb-4">Pra onde vai o dinheiro</h2>
          <div className="space-y-3">
            {[
              { icon: Server, text: "Servidor VPS 24h (~R$32/mês)" },
              { icon: Globe, text: "Domínio do site (~R$4/mês)" },
              { icon: HardDrive, text: "Disco pra cache de áudio" },
              { icon: Coffee, text: "Café pro desenvolvedor ☕" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-[14px] text-text-secondary">
                <Icon size={16} className="text-brand-gold shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  )
}
