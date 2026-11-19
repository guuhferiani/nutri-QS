import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database as DbIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  UserCheck,
  UserX,
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
import { useAuth } from '@/contexts/auth-context'
import {
  formatDataPtBr,
  getDashboardMetrics,
  getWeekBounds,
  type DashboardMetrics,
} from '@/lib/dashboard'
import { neon } from '@/lib/neon'

export function DashboardPage() {
  const { user, nutricionista } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const displayName =
    nutricionista?.nome || user?.name || user?.email?.split('@')[0] || 'Nutricionista'

  const weekBounds = getWeekBounds()

  const loadData = useCallback(
    async (silent = false) => {
      if (!user?.id) return
      if (!silent) setIsLoading(true)
      else setIsRefreshing(true)
      setError(null)

      try {
        const data = await getDashboardMetrics(user.id)
        setMetrics(data)
        setLastUpdated(new Date())
      } catch (err: unknown) {
        console.error('Erro ao carregar dados do Neon:', err)
        setError(
          'Não foi possível sincronizar os dados com o banco Neon. Verifique sua conexão e tente novamente.'
        )
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user]
  )

  useEffect(() => {
    loadData()

    // Atualização em tempo real periódica a cada 45 segundos
    const interval = setInterval(() => {
      loadData(true)
    }, 45000)

    return () => clearInterval(interval)
  }, [loadData])

  // Injeção de dados de demonstração no Neon para facilitar testes
  const handleSeedDemoData = async () => {
    if (!user?.id) return
    setIsSeeding(true)
    setError(null)
    try {
      const hoje = new Date()
      const pad = (n: number) => n.toString().padStart(2, '0')
      const toDateStr = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

      // Data de 45 dias atrás (gera paciente sem retorno)
      const data45DiasAtras = new Date()
      data45DiasAtras.setDate(hoje.getDate() - 45)
      const data45DiasAtrasStr = toDateStr(data45DiasAtras)

      // Data de 35 dias atrás
      const data35DiasAtras = new Date()
      data35DiasAtras.setDate(hoje.getDate() - 35)
      const data35DiasAtrasStr = toDateStr(data35DiasAtras)

      // Data de ontem (consulta recente desta semana)
      const dataOntem = new Date()
      dataOntem.setDate(hoje.getDate() - 1)
      const dataOntemStr = toDateStr(dataOntem)

      // Próximo retorno em 15 dias
      const dataRetornoFuturo = new Date()
      dataRetornoFuturo.setDate(hoje.getDate() + 15)
      const dataRetornoFuturoStr = toDateStr(dataRetornoFuturo)

      // 1. Cadastra 3 pacientes de demonstração vinculados ao nutricionista logado
      const { data: insertedPacientes, error: pError } = await neon
        .from('pacientes')
        .insert([
          {
            nutricionista_id: user.id,
            nome: 'Camila Rodrigues Alves',
            email: 'camila.alves@exemplo.com',
            telefone: '(11) 98765-4321',
            peso_inicial: 68.5,
            altura: 1.65,
            objetivos: ['Emagrecimento', 'Reeducação alimentar'],
            litros_agua: 2.2,
            atividade_fisica: true,
            atividade_fisica_descricao: 'Musculação 3x por semana',
          },
          {
            nutricionista_id: user.id,
            nome: 'Rodrigo Fernandes Lima',
            email: 'rodrigo.lima@exemplo.com',
            telefone: '(11) 97654-3210',
            peso_inicial: 84.0,
            altura: 1.78,
            objetivos: ['Hipertrofia', 'Ganho de massa muscular'],
            litros_agua: 3.0,
            atividade_fisica: true,
            atividade_fisica_descricao: 'Crossfit 5x por semana',
          },
          {
            nutricionista_id: user.id,
            nome: 'Mariana Duarte Silva',
            email: 'mariana.silva@exemplo.com',
            telefone: '(11) 99887-7665',
            peso_inicial: 59.0,
            altura: 1.62,
            objetivos: ['Saúde intestinal', 'Controle glicêmico'],
            litros_agua: 2.0,
            atividade_fisica: false,
          },
        ])
        .select()

      if (pError || !insertedPacientes) {
        throw pError || new Error('Falha ao inserir pacientes de teste.')
      }

      const [camila, rodrigo, mariana] = insertedPacientes

      // 2. Insere consultas:
      // - Camila: última consulta foi há 45 dias SEM retorno agendado (Card 3: Sem Retorno)
      // - Rodrigo: última consulta ontem (esta semana) COM retorno futuro agendado (Card 2: Consulta da semana)
      // - Mariana: última consulta foi há 35 dias SEM retorno agendado (Card 3: Sem Retorno)
      const { error: cError } = await neon.from('consultas').insert([
        {
          paciente_id: camila.id,
          data_consulta: data45DiasAtrasStr,
          peso: 68.5,
          percentual_gordura: 28.5,
          observacoes: 'Primeira consulta nutricional e anamnese completa.',
          proximo_retorno: null,
        },
        {
          paciente_id: rodrigo.id,
          data_consulta: dataOntemStr,
          peso: 83.2,
          percentual_gordura: 17.0,
          observacoes: 'Retorno com boa adesão à dieta hiperproteica.',
          proximo_retorno: dataRetornoFuturoStr,
        },
        {
          paciente_id: mariana.id,
          data_consulta: data35DiasAtrasStr,
          peso: 59.0,
          percentual_gordura: 24.0,
          observacoes: 'Início do protocolo FODMAPs para desconforto gástrico.',
          proximo_retorno: null,
        },
      ])

      if (cError) {
        throw cError
      }

      await loadData()
    } catch (err: unknown) {
      console.error('Erro ao gerar dados de teste:', err)
      setError('Erro ao injetar dados de demonstração no Neon.')
    } finally {
      setIsSeeding(false)
    }
  }

  // Data atual formatada (ex: Sexta-feira, 13 de novembro de 2026)
  const formattedHeaderDate = useState(() => {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  })[0]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Banner de Boas-vindas e Ações */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/70">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                Dados em tempo real via Neon
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                Olá, {displayName}!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formattedHeaderDate} • Acompanhe abaixo o resumo clínico dos seus pacientes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={isRefreshing || isLoading}
                className="gap-2 border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 cursor-pointer"
              >
                <RefreshCw
                  className={`size-4 text-emerald-600 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </Button>

              {metrics && metrics.totalPacientes === 0 && (
                <Button
                  size="sm"
                  onClick={handleSeedDemoData}
                  disabled={isSeeding || isLoading}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  {isSeeding ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  <span>Criar dados de exemplo</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ======================================================== */}
        {/* CARDS DE INFORMAÇÃO PRINCIPAIS (Prompt 3)               */}
        {/* ======================================================== */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* ---------------------------------------------------- */}
          {/* Card 1 — Total de pacientes ativos                   */}
          {/* ---------------------------------------------------- */}
          <Card className="border-emerald-100 bg-white shadow-xs transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-emerald-950">
                Total de Pacientes Ativos
              </CardTitle>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">
                <Users className="size-5.5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="size-6 animate-spin text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-emerald-950">
                    {metrics?.totalPacientes ?? 0}
                  </div>
                  <CardDescription className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserCheck className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Pacientes cadastrados sob sua responsabilidade</span>
                  </CardDescription>
                </>
              )}
            </CardContent>
          </Card>

          {/* ---------------------------------------------------- */}
          {/* Card 2 — Consultas da semana                         */}
          {/* ---------------------------------------------------- */}
          <Card className="border-emerald-100 bg-white shadow-xs transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-emerald-950">
                Consultas da Semana
              </CardTitle>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">
                <CalendarCheck className="size-5.5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="size-6 animate-spin text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-emerald-950">
                    {metrics?.consultasSemana ?? 0}
                  </div>
                  <CardDescription className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Semana atual ({weekBounds.label})</span>
                  </CardDescription>
                </>
              )}
            </CardContent>
          </Card>

          {/* ---------------------------------------------------- */}
          {/* Resumo Rápido — Retornos Pendentes                   */}
          {/* ---------------------------------------------------- */}
          <Card className="border-emerald-100 bg-white shadow-xs transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-emerald-950">
                Atenção Clínica
              </CardTitle>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">
                <Clock className="size-5.5" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="size-6 animate-spin text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-tight text-emerald-950">
                    {metrics?.pacientesSemRetorno.length ?? 0}
                  </div>
                  <CardDescription className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserX className="size-3.5 text-amber-600 shrink-0" />
                    <span>Pacientes sem consulta há mais de 30 dias</span>
                  </CardDescription>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ======================================================== */}
        {/* Card 3 — Pacientes sem retorno (Lista Detalhada)         */}
        {/* ======================================================== */}
        <Card className="border-emerald-100 bg-white shadow-xs">
          <CardHeader className="border-b border-emerald-50 pb-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Clock className="size-5 text-emerald-600" />
                  Pacientes sem retorno
                </CardTitle>
                <CardDescription className="mt-1">
                  Pacientes cuja última consulta foi realizada há mais de 30 dias e que não possuem próximo retorno agendado.
                </CardDescription>
              </div>

              {metrics && metrics.pacientesSemRetorno.length > 0 && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  {metrics.pacientesSemRetorno.length}{' '}
                  {metrics.pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'} requer atenção
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-emerald-600 mb-2" />
                <p className="text-sm">Consultando pacientes e retornos no Neon...</p>
              </div>
            ) : !metrics || metrics.pacientesSemRetorno.length === 0 ? (
              /* Requisito exato do Prompt 3: "Se não houver pacientes sem retorno, exibir a mensagem 'Nenhum paciente sem retorno no momento'" */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 mb-3.5 shadow-xs">
                  <CheckCircle2 className="size-7" />
                </div>
                <h3 className="text-base font-semibold text-emerald-950">
                  Nenhum paciente sem retorno no momento
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-md">
                  Excelente! Todos os pacientes com consultas registradas estão com retornos em dia ou foram atendidos recentemente.
                </p>
              </div>
            ) : (
              /* Lista com o nome dos pacientes — cada nome clicável redirecionando para o perfil do paciente */
              <div className="divide-y divide-emerald-50">
                {metrics.pacientesSemRetorno.map((p) => (
                  <Link
                    key={p.id}
                    to={`/pacientes/${p.id}`}
                    className="group -mx-3 flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors hover:bg-emerald-50/70"
                    title={`Ver prontuário de ${p.nome}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800 text-sm">
                        {p.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-emerald-950 group-hover:text-emerald-700 transition-colors truncate">
                          {p.nome}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                          <span>
                            Última consulta:{' '}
                            <strong className="font-medium text-emerald-900">
                              {formatDataPtBr(p.dataUltimaConsulta)}
                            </strong>
                          </span>
                          <span className="hidden sm:inline text-emerald-200">•</span>
                          <span className="text-amber-700 font-medium">
                            Há {p.diasSemRetorno} dias sem atendimento
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-4 shrink-0">
                      <span className="hidden sm:inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200/70">
                        Sem retorno agendado
                      </span>
                      <ChevronRight className="size-5 text-emerald-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rodapé informativo */}
        {lastUpdated && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <DbIcon className="size-3.5 text-emerald-600" />
              Sincronizado diretamente com a base de dados PostgreSQL no Neon
            </span>
            <span>
              Última atualização às{' '}
              {lastUpdated.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
