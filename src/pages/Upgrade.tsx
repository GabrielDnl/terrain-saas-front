import { useState } from 'react'
import api from '../lib/api'

export default function Upgrade() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await api.post('/billing/checkout', {}, {
        headers: { 'Content-Type': 'application/json' },
      })
      window.location.href = res.data.url
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors du paiement')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--ts-bg)' }}>
      <div className="rounded-2xl border p-8 max-w-md w-full" style={{ background: 'var(--ts-bg-1)', borderColor: 'var(--ts-border)' }}>
        <h1 className="text-2xl font-medium mb-2" style={{ color: 'var(--ts-text)' }}>Passer à l'abonnement</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ts-text-2)' }}>
          Accédez à toutes les fonctionnalités pour gérer votre équipe terrain.
        </p>

        <div className="rounded-xl p-6 mb-6 border" style={{ background: 'var(--ts-accent-bg)', borderColor: 'var(--ts-border-strong)' }}>
          <div className="text-3xl font-medium mb-1" style={{ color: 'var(--ts-accent-text)' }}>
            59 €<span className="text-lg font-normal" style={{ color: 'var(--ts-accent)' }}>/mois</span>
          </div>
          <div className="text-sm mb-4" style={{ color: 'var(--ts-accent-text)' }}>Jusqu'à 10 agents · Sans engagement</div>
          <ul className="space-y-2">
            {[
              'Planning hebdomadaire illimité',
              'Pointage mobile avec géolocalisation',
              'Notifications SMS automatiques',
              'Récap mensuel + export paie CSV',
              'Vue temps réel de votre équipe',
            ].map(feature => (
              <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: 'var(--ts-accent-text)' }}>
                <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 14, color: 'var(--ts-accent)' }}></i>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50"
          style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
        >
          {loading ? 'Redirection...' : "Commencer l'essai gratuit 30 jours"}
        </button>
        <p className="text-xs text-center mt-3" style={{ color: 'var(--ts-text-3)' }}>Paiement sécurisé par Stripe</p>
      </div>
    </div>
  )
}
