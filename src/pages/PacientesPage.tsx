import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Target,
  Users,
} from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { formatDataPtBr } from '@/lib/dashboard'
import { neon } from '@/lib/neon'
import type { Database } from '@/types/database'

type PacienteRow = Database['public']['Tables']['pacientes']['Row']

interface PacienteComUltimaConsulta extends PacienteRow {
  dataUltimaConsulta?: string | null
}

export function PacientesPage() {
  const { user } = useAuth()
  const [pacientes, setPacientes] = useState<PacienteComUltimaConsulta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPacientes = useCallback(
    async (silent = false) => {
      if (!user?.id) return
      if (!silent) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)

      try {
        // 1. Busca todos os pacientes da nutricionista logada
        const { data: pacientesData, error: pacError } = await neon
          .from('pacientes')
          .select('*')
          .eq('nutricionista_id', user.id)
          .order('nome', { ascending: true })

        if (pacError) throw pacError

        const loadedPacientes = pacientesData ?? []

        if (loadedPacientes.length === 0) {
          setPacientes([])
          return
        }

        const ids = loadedPacientes.map((p) => p.id)

        // 2. Busca consultas para obter a data da última consulta de cada paciente
        const { data: consultasData, error: consError } = await neon
          .from('consultas')
          .select('paciente_id, data_consulta')
          .in('paciente_id', ids)
          .order('data_consulta', { ascending: false })

        if (consError) {
          console.warn('Aviso ao carregar consultas para listagem:', consError)
        }

        const consultas = consultasData ?? []

        // Mapeia a última consulta para cada paciente
        const pacientesComConsulta: PacienteComUltimaConsulta[] =
          loadedPacientes.map((paciente) => {
            const consultasDoPaciente = consultas.filter(
              (c) => c.paciente_id === paciente.id
            )
            const ultima = consultasDoPaciente[0]?.data_consulta ?? null
            return {
              ...paciente,
              dataUltimaConsulta: ultima,
            }
          })

        setPacientes(pacientesComConsulta)
      } catch (err: unknown) {
        console.error('Erro ao buscar pacientes:', err)
        setError('Não foi possível carregar a lista de pacientes do banco Neon.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user]
  )

  useEffect(() => {
    fetchPacientes()
  }, [fetchPacientes])

  // Filtragem por busca por nome
  const filteredPacientes = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Cabeçalho com Botão Novo Paciente */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
              Pacientes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualize seus pacientes cadastrados, objetivos nutricionais e histórico de consultas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPacientes(true)}
              disabled={isLoading || isRefreshing}
              className="gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
            >
              <RefreshCw
                className={`size-4 text-emerald-600 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            {/* Botão "Novo Paciente" que redireciona para o formulário de cadastro */}
            <Link to="/pacientes/novo">
              <Button
                size="sm"
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Novo Paciente</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Campo de busca por nome no topo da listagem */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente por nome..."
            className="pl-10 h-11 bg-white border-emerald-100 text-emerald-950 focus-visible:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Listagem de Pacientes */}
        <Card className="border-emerald-100 bg-white shadow-xs">
          <CardHeader className="border-b border-emerald-50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Users className="size-5 text-emerald-600" />
                  Lista de Pacientes
                </CardTitle>
                <CardDescription className="text-xs">
                  {filteredPacientes.length}{' '}
                  {filteredPacientes.length === 1
                    ? 'paciente cadastrado'
                    : 'pacientes cadastrados'}
                </CardDescription>
              </div>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-medium text-emerald-600 hover:underline cursor-pointer"
                >
                  Limpar busca
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-emerald-600 mb-2" />
                <p className="text-sm">Carregando pacientes do Neon...</p>
              </div>
            ) : pacientes.length === 0 ? (
              /* Requisito exato do Prompt 4: "Se não houver pacientes cadastrados, exibir a mensagem 'Nenhum paciente cadastrado ainda'" */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 mb-3.5 shadow-xs">
                  <Users className="size-7" />
                </div>
                <h3 className="text-base font-semibold text-emerald-950">
                  Nenhum paciente cadastrado ainda
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-sm">
                  Comece cadastrando seu primeiro paciente para registrar consultas, avaliações físicas e planos alimentares.
                </p>
                <Link to="/pacientes/novo" className="mt-5">
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>Cadastrar Primeiro Paciente</span>
                  </Button>
                </Link>
              </div>
            ) : filteredPacientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p className="font-semibold text-emerald-950">
                  Nenhum paciente encontrado com o nome "{searchTerm}"
                </p>
                <p className="text-xs mt-1">
                  Verifique a grafia ou limpe o campo de busca.
                </p>
              </div>
            ) : (
              /* Cada paciente exibe: nome, objetivo e data da última consulta */
              <div className="divide-y divide-emerald-50">
                {filteredPacientes.map((p) => {
                  // Formatação dos objetivos
                  const objetivosText =
                    p.objetivos && p.objetivos.length > 0
                      ? p.objetivos.join(', ')
                      : p.objetivo_texto || 'Objetivo não informado'

                  return (
                    <Link
                      key={p.id}
                      to={`/pacientes/${p.id}`}
                      className="group -mx-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl px-4 py-4 transition-colors hover:bg-emerald-50/70 cursor-pointer"
                    >
                      {/* Nome e Inicial */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 font-bold text-sm shadow-xs">
                          {p.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors text-base truncate">
                            {p.nome}
                          </p>

                          {/* Objetivo */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Target className="size-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium text-emerald-900 truncate">
                              {objetivosText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Data da última consulta e ação */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Última consulta
                          </p>
                          <p className="text-xs font-semibold text-emerald-950 flex items-center gap-1 mt-0.5 sm:justify-end">
                            <Calendar className="size-3.5 text-emerald-600" />
                            {p.dataUltimaConsulta
                              ? formatDataPtBr(p.dataUltimaConsulta)
                              : 'Sem consultas registradas'}
                          </p>
                        </div>

                        <ChevronRight className="size-5 text-emerald-500 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
