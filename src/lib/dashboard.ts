import { neon } from '@/lib/neon'

export interface PacienteSemRetorno {
  id: string
  nome: string
  telefone?: string | null
  email?: string | null
  diasSemRetorno: number
  dataUltimaConsulta: string
}

export interface DashboardMetrics {
  totalPacientes: number
  consultasSemana: number
  pacientesSemRetorno: PacienteSemRetorno[]
}

/**
 * Retorna os limites (segunda a domingo) da semana de referência no formato YYYY-MM-DD
 * e uma legenda amigável (ex: "10/11 a 16/11").
 */
export function getWeekBounds(referenceDate = new Date()): {
  startOfWeek: string
  endOfWeek: string
  label: string
} {
  const current = new Date(referenceDate)
  const day = current.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(current)
  monday.setDate(current.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const pad = (n: number) => n.toString().padStart(2, '0')
  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const startOfWeek = toDateStr(monday)
  const endOfWeek = toDateStr(sunday)

  const formatShort = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
  const label = `${formatShort(monday)} a ${formatShort(sunday)}`

  return { startOfWeek, endOfWeek, label }
}

/**
 * Converte data ISO/SQL (YYYY-MM-DD) para formato legível no Brasil (DD/MM/AAAA)
 */
export function formatDataPtBr(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length !== 3) return dateStr
  const [ano, mes, dia] = parts
  return `${dia}/${mes}/${ano}`
}

/**
 * Carrega em tempo real do Neon as métricas do dashboard do nutricionista logado:
 * - Card 1: Total de pacientes ativos (número total de pacientes cadastrados pela nutricionista logada)
 * - Card 2: Consultas da semana (número de consultas registradas na semana atual)
 * - Card 3: Pacientes sem retorno (última consulta há mais de 30 dias e sem próximo retorno agendado)
 */
export async function getDashboardMetrics(nutricionistaId: string): Promise<DashboardMetrics> {
  // 1. Busca os pacientes do nutricionista
  const { data: pacientesData, error: pacientesError } = await neon
    .from('pacientes')
    .select('id, nome, telefone, email, created_at')
    .eq('nutricionista_id', nutricionistaId)

  if (pacientesError) {
    console.error('Erro ao buscar pacientes no Neon:', pacientesError)
    throw pacientesError
  }

  const pacientes = pacientesData ?? []
  const totalPacientes = pacientes.length

  if (pacientes.length === 0) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    }
  }

  const pacienteIds = pacientes.map((p) => p.id)

  // 2. Busca as consultas vinculadas a esses pacientes
  const { data: consultasData, error: consultasError } = await neon
    .from('consultas')
    .select('id, paciente_id, data_consulta, proximo_retorno, created_at')
    .in('paciente_id', pacienteIds)
    .order('data_consulta', { ascending: false })

  if (consultasError) {
    console.error('Erro ao buscar consultas no Neon:', consultasError)
    throw consultasError
  }

  const consultas = consultasData ?? []

  // 3. Consultas da semana atual
  const { startOfWeek, endOfWeek } = getWeekBounds()
  const consultasSemana = consultas.filter((c) => {
    return c.data_consulta >= startOfWeek && c.data_consulta <= endOfWeek
  }).length

  // 4. Pacientes sem retorno
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const hojeStr = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`

  const pacientesSemRetorno: PacienteSemRetorno[] = []

  for (const paciente of pacientes) {
    const pacienteConsultas = consultas.filter((c) => c.paciente_id === paciente.id)
    if (pacienteConsultas.length === 0) {
      continue
    }

    // A consulta mais recente
    const ultimaConsulta = pacienteConsultas[0]
    if (!ultimaConsulta.data_consulta) continue

    const [uAno, uMes, uDia] = ultimaConsulta.data_consulta.split('-').map(Number)
    const dataUltima = new Date(uAno, uMes - 1, uDia)
    const diffMs = hoje.getTime() - dataUltima.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // Última consulta há mais de 30 dias?
    if (diffDias > 30) {
      // Verifica se possui próximo retorno agendado para hoje ou data futura
      const temRetornoFuturo = pacienteConsultas.some((c) => {
        if (!c.proximo_retorno) return false
        return c.proximo_retorno >= hojeStr
      })

      if (!temRetornoFuturo) {
        pacientesSemRetorno.push({
          id: paciente.id,
          nome: paciente.nome,
          telefone: paciente.telefone,
          email: paciente.email,
          diasSemRetorno: diffDias,
          dataUltimaConsulta: ultimaConsulta.data_consulta,
        })
      }
    }
  }

  // Ordena pelos que estão há mais dias sem retorno
  pacientesSemRetorno.sort((a, b) => b.diasSemRetorno - a.diasSemRetorno)

  return {
    totalPacientes,
    consultasSemana,
    pacientesSemRetorno,
  }
}
