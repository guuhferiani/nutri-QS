import { neon } from '@/lib/neon'
import type { Nutricionista } from '@/types/database'

interface EnsureNutricionistaInput {
  id: string
  nome: string
  email: string
}

/**
 * Busca o perfil do nutricionista autenticado na tabela `nutricionistas`.
 */
export async function getNutricionistaProfile(
  userId: string
): Promise<Nutricionista | null> {
  const { data, error } = await neon
    .from('nutricionistas')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

/**
 * Garante que o registro do nutricionista exista na tabela `nutricionistas`
 * do Neon usando o mesmo UUID do Neon Auth (necessário para o RLS `id = auth.uid()`).
 */
export async function ensureNutricionistaProfile({
  id,
  nome,
  email,
}: EnsureNutricionistaInput): Promise<Nutricionista> {
  const cleanName = nome.trim() || email.split('@')[0] || 'Nutricionista'
  const normalizedEmail = email.trim().toLowerCase()

  const existing = await getNutricionistaProfile(id)
  if (existing) {
    return existing
  }

  const { data, error } = await neon
    .from('nutricionistas')
    .upsert(
      {
        id,
        nome: cleanName,
        email: normalizedEmail,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

