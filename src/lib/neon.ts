import { createClient } from '@neon/neon-js'
import { BetterAuthReactAdapter } from '@neon/neon-js/auth/react/adapters'
import type { Database } from '@/types/database'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

if (!authUrl || !dataApiUrl) {
  throw new Error(
    'Configuração do Neon ausente: defina VITE_NEON_AUTH_URL e VITE_NEON_DATA_API_URL no arquivo .env.'
  )
}

export const neon = createClient<Database>({
  auth: {
    url: authUrl,
    adapter: BetterAuthReactAdapter(),
  },
  dataApi: {
    url: dataApiUrl,
  },
})

