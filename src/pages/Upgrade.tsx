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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Passer à l'abonnement</h1>
        <p className="text-gray-500 text-sm mb-8">Accédez à toutes les fonctionnalités pour gérer votre équipe terrain.</p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
          <div className="text-3xl font-medium text-blue-900 mb-1">59 €<span className="text-lg font-normal text-blue-600">/mois</span></div>
          <div className="text-sm text-blue-700 mb-4">Jusqu'à 10 agents · Sans engagement</div>
          <ul className="space-y-2">
            {[
              'Planning hebdomadaire illimité',
              'Pointage mobile avec géolocalisation',
              'Notifications SMS automatiques',
              'Récap mensuel + export paie CSV',
              'Vue temps réel de votre équipe',
            ].map(feature => (
              <li key={feature} className="flex items-center gap-2 text-sm text-blue-800">
                <span className="text-blue-500">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Redirection...' : 'Commencer l\'essai gratuit 30 jours'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Paiement sécurisé par Stripe</p>
      </div>
    </div>
  )
}