import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { NutriLogo } from '@/components/NutriLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, nutricionista, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const displayName =
    nutricionista?.nome || user?.name || user?.email?.split('@')[0] || 'Nutricionista'
  const displayEmail = nutricionista?.email || user?.email || ''

  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || 'NQ'

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/dashboard' || location.pathname === '/',
    },
    {
      label: 'Pacientes',
      href: '/pacientes',
      icon: Users,
      isActive: location.pathname.startsWith('/pacientes'),
    },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 text-foreground">
      {/* Decorações sutis de fundo */}
      <div
        className="pointer-events-none fixed -top-40 right-10 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-10 left-64 h-80 w-80 rounded-full bg-emerald-50/60 blur-3xl"
        aria-hidden="true"
      />

      {/* Barra superior no mobile */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-emerald-100 bg-white/95 px-4 backdrop-blur-md md:hidden">
        <Link to="/dashboard" className="focus:outline-none">
          <NutriLogo size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-emerald-100 text-emerald-800 hover:bg-emerald-50 focus:outline-none"
          aria-label="Abrir menu de navegação"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Menu lateral fixo para Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-emerald-100 bg-white/95 shadow-sm backdrop-blur-md md:flex">
        {/* Topo com Logotipo */}
        <div className="flex h-20 items-center border-b border-emerald-100/70 px-6">
          <Link to="/dashboard" className="focus:outline-none">
            <NutriLogo size="md" showSubtitle />
          </Link>
        </div>

        {/* Links de navegação */}
        <div className="flex-1 px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-emerald-800/60 uppercase">
            Menu Principal
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                    item.isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                      : 'text-emerald-950/80 hover:bg-emerald-50 hover:text-emerald-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'size-4.5 transition-transform group-hover:scale-105',
                      item.isActive ? 'text-white' : 'text-emerald-600'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Rodapé do Menu Lateral com dados do usuário */}
        <div className="border-t border-emerald-100 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-emerald-950">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="mt-3 w-full justify-center gap-2 border-emerald-200 bg-white text-emerald-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
          >
            <LogOut className="size-4" />
            <span>Sair do sistema</span>
          </Button>
        </div>
      </aside>

      {/* Drawer do Menu Lateral no Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay escuro */}
          <div
            className="fixed inset-0 bg-emerald-950/30 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Drawer */}
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-emerald-100 px-6">
              <NutriLogo size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-emerald-800 hover:text-emerald-950"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 px-4 py-6">
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors',
                        item.isActive
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-emerald-950/80 hover:bg-emerald-50 hover:text-emerald-900'
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5',
                          item.isActive ? 'text-white' : 'text-emerald-600'
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-emerald-100 bg-emerald-50/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-emerald-950">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="mt-3 w-full justify-center gap-2 border-emerald-200 bg-white text-emerald-800"
              >
                <LogOut className="size-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal — com padding à esquerda para o menu lateral fixo no Desktop */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
