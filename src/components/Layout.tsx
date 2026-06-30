import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const links = [
    { href: '/planning', label: 'Planning' },
    { href: '/agents', label: 'Agents' },
    { href: '/live', label: 'Vue live' },
    { href: '/recap', label: 'Récap mensuel' },
    { href: '/upgrade', label: 'Abonnement' },
    { href: '/profile', label: 'Profil' },
  ]

  const current = window.location.pathname

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-blue-600 font-semibold text-base">Terrain SaaS</span>
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  current === link.href
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="hidden md:block text-sm text-gray-500 hover:text-gray-700"
          >
            Déconnexion
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-500"
          >
            ☰
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-3 flex flex-col gap-2">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 py-1"
            >
              {link.label}
            </a>
          ))}
          <button onClick={logout} className="text-sm text-red-500 text-left py-1">
            Déconnexion
          </button>
        </div>
      )}

      <main>{children}</main>
    </div>
  )
}
