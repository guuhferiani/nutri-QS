import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  AuthContext,
  type AuthActionResult,
  type AuthSession,
  type AuthUser,
} from '@/contexts/auth-context'
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors'
import { neon } from '@/lib/neon'
import { ensureNutricionistaProfile } from '@/lib/nutricionista'
import type { Nutricionista } from '@/types/database'

async function fetchInitialSession() {
  const result = await neon.auth.getSession()
  if (!result.data?.session || !result.data?.user) {
    return null
  }

  let profile: Nutricionista | null = null
  try {
    profile = await ensureNutricionistaProfile({
      id: result.data.user.id,
      nome:
        result.data.user.name ||
        result.data.user.email.split('@')[0] ||
        'Nutricionista',
      email: result.data.user.email,
    })
  } catch (err) {
    console.error('Erro ao carregar perfil do nutricionista:', err)
  }

  return {
    session: result.data.session,
    user: result.data.user,
    nutricionista: profile,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [nutricionista, setNutricionista] = useState<Nutricionista | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const syncProfile = useCallback(async (authUser: AuthUser) => {
    try {
      const profile = await ensureNutricionistaProfile({
        id: authUser.id,
        nome: authUser.name || authUser.email.split('@')[0] || 'Nutricionista',
        email: authUser.email,
      })
      setNutricionista(profile)
    } catch (err) {
      console.error('Erro ao carregar perfil do nutricionista:', err)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const loaded = await fetchInitialSession()
      if (loaded) {
        setSession(loaded.session)
        setUser(loaded.user)
        setNutricionista(loaded.nutricionista)
      } else {
        setSession(null)
        setUser(null)
        setNutricionista(null)
      }
    } catch (err) {
      console.error('Erro ao verificar sessão:', err)
      setSession(null)
      setUser(null)
      setNutricionista(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchInitialSession()
      .then((loaded) => {
        if (!active) return
        if (loaded) {
          setSession(loaded.session)
          setUser(loaded.user)
          setNutricionista(loaded.nutricionista)
        }
      })
      .catch((err) => {
        console.error('Erro ao restaurar sessão:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const normalizedEmail = email.trim().toLowerCase()

      try {
        const result = await neon.auth.signIn.email({
          email: normalizedEmail,
          password,
          rememberMe: true,
        })

        if (result.error) {
          return {
            error: getFriendlyAuthErrorMessage(result.error, 'login'),
          }
        }

        const sessionResult = await neon.auth.getSession()
        if (!sessionResult.data?.session || !sessionResult.data?.user) {
          return {
            error:
              'Não foi possível iniciar sua sessão. Tente entrar novamente.',
          }
        }

        setSession(sessionResult.data.session)
        setUser(sessionResult.data.user)
        await syncProfile(sessionResult.data.user)

        return { error: null }
      } catch (err) {
        return {
          error: getFriendlyAuthErrorMessage(err, 'login'),
        }
      }
    },
    [syncProfile]
  )

  const signUp = useCallback(
    async (
      nome: string,
      email: string,
      password: string
    ): Promise<AuthActionResult> => {
      const cleanName = nome.trim()
      const normalizedEmail = email.trim().toLowerCase()

      if (password.length < 9) {
        return { error: 'A senha deve ter no mínimo 9 caracteres.' }
      }

      try {
        const result = await neon.auth.signUp.email({
          name: cleanName,
          email: normalizedEmail,
          password,
        })

        if (result.error) {
          return {
            error: getFriendlyAuthErrorMessage(result.error, 'signup'),
          }
        }

        let sessionResult = await neon.auth.getSession()

        if (!sessionResult.data?.session || !sessionResult.data?.user) {
          const signInFallback = await neon.auth.signIn.email({
            email: normalizedEmail,
            password,
            rememberMe: true,
          })

          if (signInFallback.error) {
            return {
              error: getFriendlyAuthErrorMessage(signInFallback.error, 'login'),
            }
          }

          sessionResult = await neon.auth.getSession()
        }

        const activeUser = sessionResult.data?.user
        const activeSession = sessionResult.data?.session

        if (!activeUser || !activeSession) {
          return {
            error:
              'Conta criada, mas não foi possível ativar sua sessão automaticamente. Faça login para continuar.',
          }
        }

        const profile = await ensureNutricionistaProfile({
          id: activeUser.id,
          nome: cleanName,
          email: normalizedEmail,
        })

        setNutricionista(profile)
        setSession(activeSession)
        setUser(activeUser)

        return { error: null }
      } catch (err) {
        console.error('Erro ao cadastrar nutricionista:', err)
        return {
          error: getFriendlyAuthErrorMessage(err, 'signup'),
        }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    try {
      await neon.auth.signOut()
    } finally {
      setSession(null)
      setUser(null)
      setNutricionista(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        nutricionista,
        isLoading,
        isAuthenticated: Boolean(session && user),
        signIn,
        signUp,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
