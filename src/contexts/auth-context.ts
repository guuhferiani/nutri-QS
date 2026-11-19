import { createContext, useContext } from 'react'
import type { neon } from '@/lib/neon'
import type { Nutricionista } from '@/types/database'

type SessionData = NonNullable<
  Awaited<ReturnType<typeof neon.auth.getSession>>['data']
>
export type AuthUser = SessionData['user']
export type AuthSession = SessionData['session']

export interface AuthActionResult {
  error: string | null
}

export interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  nutricionista: Nutricionista | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signUp: (
    nome: string,
    email: string,
    password: string
  ) => Promise<AuthActionResult>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.')
  }
  return ctx
}

