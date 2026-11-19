import type { ReactNode } from 'react'
import { NutriLogo } from '@/components/NutriLogo'

const CURRENT_YEAR = new Date().getFullYear()

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50/90 via-white to-emerald-50/50 px-4 py-10">
      {/* Decoração sutil em verde e branco */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center">
        <header className="mb-7 flex flex-col items-center text-center">
          <NutriLogo size="lg" showSubtitle />
        </header>

        <main className="w-full">{children}</main>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          © {CURRENT_YEAR} Nutri QS • Plataforma de gestão nutricional
        </footer>
      </div>
    </div>
  )
}
