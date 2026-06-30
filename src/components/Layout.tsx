import { useState } from 'react'
import { useTheme, THEME_LABELS, THEME_DOT_COLORS, type ThemeName } from '../lib/ThemeContext'

interface LayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/', label: 'Tableau de bord', icon: 'ti-layout-dashboard', shortLabel: 'Accueil' },
  { href: '/planning', label: 'Planning', icon: 'ti-calendar-week', shortLabel: 'Planning' },
  { href: '/agents', label: 'Agents', icon: 'ti-users', shortLabel: 'Agents' },
  { href: '/recap', label: 'Récap mensuel', icon: 'ti-file-export', shortLabel: 'Récap' },
  { href: '/upgrade', label: 'Abonnement', icon: 'ti-credit-card', shortLabel: 'Abo' },
  { href: '/profile', label: 'Profil', icon: 'ti-settings', shortLabel: 'Profil' },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Vue d\'ensemble',
  '/planning': 'Planning',
  '/agents': 'Agents',
  '/recap': 'Récap mensuel',
  '/upgrade': 'Abonnement',
  '/profile': 'Profil',
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const current = window.location.pathname
  const themeOrder: ThemeName[] = ['sl', 'sao', 'emerald']

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const pageTitle = PAGE_TITLES[current] || 'Terrain SaaS'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ts-bg)' }}>
      {/* SIDEBAR */}
      <aside
        className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-1 border-r"
        style={{ background: 'var(--ts-sidebar-bg)', borderColor: 'var(--ts-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mb-3"
          style={{ background: 'var(--ts-accent)', color: 'var(--ts-bg-1)' }}
        >
          T
        </div>

        {NAV_ITEMS.map(item => (
          <a
            key={item.href}
            href={item.href}
            title={item.label}
            className="w-12 py-2 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={
              current === item.href
                ? { background: 'var(--ts-accent-bg)', color: 'var(--ts-accent)', border: '1px solid var(--ts-border-strong)' }
                : { color: 'var(--ts-text-3)' }
            }
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" style={{ fontSize: 17 }}></i>
            <span style={{ fontSize: 9, lineHeight: 1 }}>{item.shortLabel}</span>
          </a>
        ))}

        <div className="flex-1"></div>

        <button
          onClick={logout}
          title="Déconnexion"
          className="w-12 py-2 rounded-lg flex flex-col items-center justify-center gap-0.5"
          style={{ color: 'var(--ts-red)' }}
          aria-label="Déconnexion"
        >
          <i className="ti ti-logout" aria-hidden="true" style={{ fontSize: 17 }}></i>
          <span style={{ fontSize: 9, lineHeight: 1 }}>Sortir</span>
        </button>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: 'var(--ts-nav-bg)', borderColor: 'var(--ts-border)' }}
        >
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ts-text-3)' }}>
            <span className="font-medium tracking-wide" style={{ color: 'var(--ts-text-3)' }}>TERRAIN·SAAS</span>
            <i className="ti ti-chevron-right" aria-hidden="true" style={{ fontSize: 12 }}></i>
            <span className="font-medium" style={{ color: 'var(--ts-accent)' }}>{pageTitle}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5" role="group" aria-label="Choisir un thème">
              {themeOrder.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  title={THEME_LABELS[t]}
                  aria-label={`Thème ${THEME_LABELS[t]}`}
                  aria-pressed={theme === t}
                  className="w-5 h-5 rounded-full transition-transform"
                  style={{
                    background: THEME_DOT_COLORS[t],
                    border: theme === t ? '2px solid var(--ts-accent)' : '2px solid transparent',
                    transform: theme === t ? 'scale(1.1)' : 'scale(1)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--ts-green)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ts-green)' }}></span>
              LIVE
            </div>

            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--ts-accent-bg)', color: 'var(--ts-accent-text)', border: '1px solid var(--ts-border-strong)' }}
            >
              DG
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1"
              style={{ color: 'var(--ts-text-2)' }}
              aria-label="Ouvrir le menu"
            >
              <i className="ti ti-menu-2" aria-hidden="true" style={{ fontSize: 20 }}></i>
            </button>
          </div>
        </header>

        {menuOpen && (
          <div
            className="md:hidden border-b px-5 py-3 flex flex-col gap-2"
            style={{ background: 'var(--ts-nav-bg)', borderColor: 'var(--ts-border)' }}
          >
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={item.href} className="text-sm py-1 flex items-center gap-2" style={{ color: 'var(--ts-text-2)' }}>
                <i className={`ti ${item.icon}`} aria-hidden="true"></i>
                {item.label}
              </a>
            ))}
            <div className="flex items-center gap-2 py-2" role="group" aria-label="Choisir un thème">
              {themeOrder.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-label={`Thème ${THEME_LABELS[t]}`}
                  aria-pressed={theme === t}
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: THEME_DOT_COLORS[t],
                    border: theme === t ? '2px solid var(--ts-accent)' : '2px solid transparent',
                  }}
                />
              ))}
            </div>
            <button onClick={logout} className="text-sm text-left py-1" style={{ color: 'var(--ts-red)' }}>
              Déconnexion
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}