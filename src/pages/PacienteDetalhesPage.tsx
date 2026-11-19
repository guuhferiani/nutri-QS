import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  Apple,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  HeartPulse,
  Loader2,
  Mail,
  Phone,
  Scale,
  Target,
  User,
  Utensils,
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
import { formatDataPtBr } from '@/lib/dashboard'
import { neon } from '@/lib/neon'
import { calculateAge, calculateImc } from '@/lib/paciente-utils'
import type { Database } from '@/types/database'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type Consulta = Database['public']['Tables']['consultas']['Row']

export function PacienteDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaciente = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: pacienteData, error: pacError } = await neon
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (pacError) throw pacError
      if (!pacienteData) {
        setError('Paciente não encontrado.')
        return
      }

      setPaciente(pacienteData)

      const { data: consultasData, error: consError } = await neon
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false })

      if (consError) throw consError
      setConsultas(consultasData ?? [])
    } catch (err: unknown) {
      console.error('Erro ao carregar detalhes do paciente:', err)
      setError('Erro ao carregar dados do paciente do Neon.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPaciente()
  }, [fetchPaciente])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm">Carregando prontuário do paciente...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !paciente) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link to="/pacientes">
            <Button variant="outline" size="sm" className="gap-2 border-emerald-200">
              <ArrowLeft className="size-4" />
              Voltar para pacientes
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error || 'Paciente não encontrado.'}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  const idadeCalculada = calculateAge(paciente.data_nascimento)
  const imcCalculado = calculateImc(paciente.peso_inicial, paciente.altura)

  // Altura formatada em cm ou m
  const alturaFormatada = paciente.altura
    ? paciente.altura > 3
      ? `${paciente.altura} cm`
      : `${(paciente.altura * 100).toFixed(0)} cm (${paciente.altura} m)`
    : '—'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Voltar */}
        <div className="flex items-center justify-between">
          <Link to="/pacientes">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Voltar para pacientes</span>
            </Button>
          </Link>
        </div>

        {/* Cabeçalho do Prontuário */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 font-bold text-2xl text-white shadow-md shadow-emerald-600/30">
                {paciente.nome.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                    {paciente.nome}
                  </h1>
                  {paciente.sexo && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                      {paciente.sexo}
                    </span>
                  )}
                  {idadeCalculada !== null && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                      {idadeCalculada} anos
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {paciente.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5 text-emerald-600" />
                      {paciente.email}
                    </span>
                  )}
                  {paciente.telefone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-emerald-600" />
                      {paciente.telefone}
                    </span>
                  )}
                  {paciente.whatsapp && paciente.whatsapp !== paciente.telefone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-emerald-600" />
                      WhatsApp: {paciente.whatsapp}
                    </span>
                  )}
                  {paciente.created_at && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-emerald-600" />
                      Cadastrado em {formatDataPtBr(paciente.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Parâmetros Físicos & IMC                            */}
        {/* ---------------------------------------------------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">
                Peso Atual
              </CardTitle>
              <Scale className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-950">
                {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '—'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">
                Altura
              </CardTitle>
              <User className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-950">
                {alturaFormatada}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">
                IMC
              </CardTitle>
              <HeartPulse className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-950">
                {imcCalculado ? `${imcCalculado.imc}` : '—'}
              </div>
              {imcCalculado && (
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${imcCalculado.colorBadge}`}
                >
                  {imcCalculado.classification}
                </span>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">
                Consumo de Água
              </CardTitle>
              <Droplet className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-950">
                {paciente.litros_agua ? `${paciente.litros_agua} L/dia` : '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Objetivos e Perfil Clínico                         */}
        {/* ---------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card Objetivos & Histórico Clínico */}
          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader className="border-b border-emerald-50 pb-3">
              <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Target className="size-5 text-emerald-600" />
                Objetivos & Condições Clínicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Objetivos */}
              <div>
                <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                  Objetivos Nutricionais
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.objetivos && paciente.objetivos.length > 0 ? (
                    paciente.objetivos.map((obj) => (
                      <span
                        key={obj}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        {obj}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Não especificado
                    </span>
                  )}
                </div>
                {paciente.objetivo_texto && (
                  <p className="mt-2 text-xs text-muted-foreground italic bg-emerald-50/50 p-2 rounded-md">
                    "{paciente.objetivo_texto}"
                  </p>
                )}
              </div>

              {/* Patologias */}
              <div>
                <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                  Patologias / Condições
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.patologias && paciente.patologias.length > 0 ? (
                    paciente.patologias.map((pat) => (
                      <span
                        key={pat}
                        className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200"
                      >
                        {pat}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Nenhuma patologia registrada
                    </span>
                  )}
                </div>
              </div>

              {/* Restrições Alimentares */}
              <div>
                <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                  Restrições Alimentares
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.restricoes_alimentares &&
                  paciente.restricoes_alimentares.length > 0 ? (
                    paciente.restricoes_alimentares.map((res) => (
                      <span
                        key={res}
                        className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800 ring-1 ring-orange-200"
                      >
                        {res}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Nenhuma restrição alimentar
                    </span>
                  )}
                </div>
              </div>

              {/* Alergias Alimentares */}
              <div>
                <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                  Alergias Alimentares
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paciente.alergias && paciente.alergias.length > 0 ? (
                    paciente.alergias.map((ale) => (
                      <span
                        key={ale}
                        className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-200"
                      >
                        {ale}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Nenhuma alergia relatada
                    </span>
                  )}
                </div>
              </div>

              {/* Medicamentos e Suplementos */}
              {(paciente.medicamentos || paciente.suplementos) && (
                <div className="border-t border-emerald-50 pt-3 space-y-2">
                  {paciente.medicamentos && (
                    <div className="text-xs">
                      <strong className="text-emerald-950">Medicamentos:</strong>{' '}
                      <span className="text-muted-foreground">{paciente.medicamentos}</span>
                    </div>
                  )}
                  {paciente.suplementos && (
                    <div className="text-xs">
                      <strong className="text-emerald-950">Suplementos:</strong>{' '}
                      <span className="text-muted-foreground">{paciente.suplementos}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Rotina, Hábitos e Atividade Física */}
          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader className="border-b border-emerald-50 pb-3">
              <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Apple className="size-5 text-emerald-600" />
                Rotina & Hábitos de Vida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Utensils className="size-3.5 text-emerald-600" />
                    Refeições / dia
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950">
                    {paciente.refeicoes_por_dia ? `${paciente.refeicoes_por_dia}x` : '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Activity className="size-3.5 text-emerald-600" />
                    Nível de Atividade
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-950 truncate">
                    {paciente.nivel_atividade || 'Não informado'}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-emerald-600" />
                    Acorda às
                  </p>
                  <p className="mt-1 text-base font-bold text-emerald-950">
                    {paciente.horario_acorda || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                  <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-emerald-600" />
                    Dorme às
                  </p>
                  <p className="mt-1 text-base font-bold text-emerald-950">
                    {paciente.horario_dorme || '—'}
                  </p>
                </div>
              </div>

              {/* Atividade Física */}
              <div className="rounded-xl border border-emerald-100 bg-white p-3">
                <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                  Prática de Exercícios Físicos
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      paciente.atividade_fisica
                        ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {paciente.atividade_fisica ? 'Ativo' : 'Não pratica'}
                  </span>
                  {paciente.atividade_fisica_descricao && (
                    <span className="text-xs text-muted-foreground">
                      {paciente.atividade_fisica_descricao}
                    </span>
                  )}
                </div>
              </div>

              {/* Observações Gerais */}
              {paciente.observacoes && (
                <div>
                  <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                    Observações Clínicas Gerais
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                    {paciente.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Histórico de Consultas                              */}
        {/* ---------------------------------------------------- */}
        <Card className="border-emerald-100 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Calendar className="size-5 text-emerald-600" />
              Histórico de Consultas ({consultas.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Evolução clínica e retornos cadastrados para este paciente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consultas.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma consulta registrada ainda para este paciente.
              </div>
            ) : (
              <div className="divide-y divide-emerald-50">
                {consultas.map((c) => (
                  <div key={c.id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-950 text-sm">
                        Consulta em {formatDataPtBr(c.data_consulta)}
                      </span>
                      {c.proximo_retorno ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Próximo retorno: {formatDataPtBr(c.proximo_retorno)}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md ring-1 ring-amber-200">
                          Sem próximo retorno agendado
                        </span>
                      )}
                    </div>
                    {c.observacoes && (
                      <p className="text-xs text-muted-foreground">
                        {c.observacoes}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                      {c.peso && <span>Peso: {c.peso} kg</span>}
                      {c.percentual_gordura && <span>Gordura: {c.percentual_gordura}%</span>}
                      {c.cintura && <span>Cintura: {c.cintura} cm</span>}
                      {c.quadril && <span>Quadril: {c.quadril} cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
