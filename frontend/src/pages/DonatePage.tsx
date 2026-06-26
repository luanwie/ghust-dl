export default function DonatePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Contribua 💛
        </h1>
        <p className="text-text-secondary">
          GHUST-DL é gratuito e não tem assinatura.
          Se o site te ajudou a encontrar aquela música que você ia tocar no próximo set,
          considere fazer um Pix. Qualquer valor ajuda a manter o servidor rodando.
        </p>
      </div>

      <div className="glass rounded-2xl p-8 text-center">
        {/* QR Code placeholder */}
        <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center">
          <p className="text-bg-base text-sm font-medium">Seu QR Code Pix aqui</p>
        </div>

        <div className="space-y-3">
          <div className="glass rounded-xl p-4">
            <p className="text-text-secondary text-xs mb-1">Chave Pix (CPF)</p>
            <p className="text-text-primary font-mono text-lg">000.000.000-00</p>
          </div>

          <button
            onClick={() => navigator.clipboard.writeText("000.000.000-00")}
            className="w-full bg-brand-gold text-bg-base font-semibold py-3 rounded-xl hover:brightness-110 transition-all cursor-pointer"
          >
            Copiar chave Pix
          </button>
        </div>

        <p className="text-text-secondary text-xs mt-6">
          Sua contribuição vai diretamente pra hospedagem do servidor e cache de músicas.
          Obrigado! 🎧
        </p>
      </div>

      <div className="mt-8 glass rounded-xl p-6">
        <h2 className="text-text-primary font-semibold mb-3">Por que doar?</h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>• Custo do servidor VPS (~R$32/mês)</li>
          <li>• Domínio do site (~R$4/mês)</li>
          <li>• Disco pra cache de áudio cresce com o uso</li>
          <li>• Se sobrar, vira café pro desenvolvedor ☕</li>
        </ul>
      </div>
    </div>
  )
}
