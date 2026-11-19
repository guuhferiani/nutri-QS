import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Apple,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  HeartPulse,
  Loader2,
  Plus,
  Save,
  Scale,
  User,
  X,
} from 'lucide-react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { neon } from '@/lib/neon'
import {
  calculateAge,
  calculateImc,
  convertNumberToTime,
  formatPhoneNumber,
} from '@/lib/paciente-utils'
import { cn } from '@/lib/utils'

const OBJETIVOS_PREDEFINIDOS = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
]

const NIVEIS_ATIVIDADE = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
]

const PATOLOGIAS_PREDEFINIDAS = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
]

const RESTRICOES_PREDEFINIDAS = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
]

const ALERGIAS_PREDEFINIDAS = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
]

type TabKey = 'pessoal' | 'clinico' | 'habitos'

export function NovoPacientePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<TabKey>('pessoal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // ----------------------------------------------------
  // Aba 1 — Pessoal
  // ----------------------------------------------------
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro' | ''>('')
  const [telefone, setTelefone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  // ----------------------------------------------------
  // Aba 2 — Clínico
  // ----------------------------------------------------
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [objetivos, setObjetivos] = useState<string[]>([])
  const [objetivoTexto, setObjetivoTexto] = useState('')
  const [nivelAtividade, setNivelAtividade] = useState('')

  // Patologias
  const [patologias, setPatologias] = useState<string[]>([])
  const [novaPatologia, setNovaPatologia] = useState('')

  // Restrições alimentares
  const [restricoes, setRestricoes] = useState<string[]>([])
  const [novaRestricao, setNovaRestricao] = useState('')

  // Alergias
  const [alergias, setAlergias] = useState<string[]>([])
  const [novaAlergia, setNovaAlergia] = useState('')

  const [medicamentos, setMedicamentos] = useState('')
  const [suplementos, setSuplementos] = useState('')

  // ----------------------------------------------------
  // Aba 3 — Hábitos
  // ----------------------------------------------------
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('')
  const [horarioAcorda, setHorarioAcorda] = useState('')
  const [horarioDorme, setHorarioDorme] = useState('')
  const [litrosAgua, setLitrosAgua] = useState('')
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState<boolean | null>(null)
  const [atividadeFisicaDescricao, setAtividadeFisicaDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Cálculos automáticos em tempo de digitação
  const idadeCalculada = calculateAge(dataNascimento)
  const imcCalculado = calculateImc(peso, altura)

  // Manipuladores de tags com opção "Nenhum" e adição livre
  const toggleArrayOption = (
    currentList: string[],
    setList: (val: string[]) => void,
    item: string
  ) => {
    if (item === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([])
      } else {
        setList(['Nenhum'])
      }
      return
    }

    const withoutNenhum = currentList.filter((x) => x !== 'Nenhum')
    if (withoutNenhum.includes(item)) {
      setList(withoutNenhum.filter((x) => x !== item))
    } else {
      setList([...withoutNenhum, item])
    }
  }

  const addCustomItem = (
    currentList: string[],
    setList: (val: string[]) => void,
    newItem: string,
    clearInput: () => void
  ) => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    const withoutNenhum = currentList.filter((x) => x !== 'Nenhum')
    if (!withoutNenhum.includes(trimmed)) {
      setList([...withoutNenhum, trimmed])
    }
    clearInput()
  }

  const removeArrayItem = (
    currentList: string[],
    setList: (val: string[]) => void,
    itemToRemove: string
  ) => {
    setList(currentList.filter((x) => x !== itemToRemove))
  }

  // Manipuladores de hora automática (ex: 6 → 06:00, 630 → 06:30)
  const handleHorarioBlur = (
    val: string,
    setter: (formatted: string) => void
  ) => {
    const converted = convertNumberToTime(val)
    setter(converted)
  }

  // Submissão do formulário
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)

    // Validação da regra do Prompt 4: "O único campo obrigatório é o nome completo"
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      setErrorMessage('O campo Nome Completo é obrigatório para cadastrar o paciente.')
      setActiveTab('pessoal')
      return
    }

    if (!user?.id) {
      setErrorMessage('Sessão expirada. Faça login novamente para cadastrar pacientes.')
      return
    }

    setIsSubmitting(true)

    try {
      // Normalização de dados para inserção no banco Neon
      const pesoNum = peso ? parseFloat(peso.replace(',', '.')) : null
      const alturaNum = altura ? parseFloat(altura.replace(',', '.')) : null
      const refeicoesNum = refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null
      const aguaNum = litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : null

      const { data, error } = await neon
        .from('pacientes')
        .insert({
          nutricionista_id: user.id,
          nome: nomeLimpo,
          data_nascimento: dataNascimento || null,
          sexo: sexo || null,
          telefone: telefone || null,
          whatsapp: whatsapp || null,
          email: email.trim().toLowerCase() || null,
          peso_inicial: isNaN(pesoNum ?? NaN) ? null : pesoNum,
          altura: isNaN(alturaNum ?? NaN) ? null : alturaNum,
          objetivos: objetivos.length > 0 ? objetivos : null,
          objetivo_texto: objetivoTexto.trim() || null,
          nivel_atividade: nivelAtividade || null,
          patologias: patologias.length > 0 ? patologias : null,
          restricoes_alimentares: restricoes.length > 0 ? restricoes : null,
          alergias: alergias.length > 0 ? alergias : null,
          medicamentos: medicamentos.trim() || null,
          suplementos: suplementos.trim() || null,
          refeicoes_por_dia: isNaN(refeicoesNum ?? NaN) ? null : refeicoesNum,
          horario_acorda: convertNumberToTime(horarioAcorda) || null,
          horario_dorme: convertNumberToTime(horarioDorme) || null,
          litros_agua: isNaN(aguaNum ?? NaN) ? null : aguaNum,
          atividade_fisica: praticaAtividadeFisica,
          atividade_fisica_descricao:
            praticaAtividadeFisica ? atividadeFisicaDescricao.trim() || null : null,
          observacoes: observacoes.trim() || null,
        })
        .select()
        .single()

      if (error || !data) {
        throw error || new Error('Não foi possível salvar o paciente no Neon.')
      }

      setSuccessMessage('Paciente cadastrado com sucesso! Redirecionando para o perfil...')

      // Redireciona para o perfil do paciente recém-cadastrado conforme Prompt 4
      setTimeout(() => {
        navigate(`/pacientes/${data.id}`, { replace: true })
      }, 900)
    } catch (err: unknown) {
      console.error('Erro ao cadastrar paciente:', err)
      setErrorMessage(
        'Ocorreu um erro ao salvar os dados no Neon. Por favor, tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Topo com Navegação de Retorno */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/pacientes">
              <Button
                variant="outline"
                size="sm"
                className="size-9 p-0 border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                title="Voltar para lista de pacientes"
              >
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                Novo Paciente
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Preencha a ficha clínica e nutricional do paciente. Apenas o nome completo é obrigatório.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Paciente'}</span>
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <AlertDescription className="font-medium">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* ======================================================== */}
        {/* NAVEGAÇÃO ENTRE AS 3 ABAS: Pessoal, Clínico e Hábitos   */}
        {/* ======================================================== */}
        <div className="flex border-b border-emerald-100 bg-white/70 backdrop-blur-xs rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'pessoal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-950/70 hover:bg-emerald-50 hover:text-emerald-900'
            )}
          >
            <User className="size-4.5" />
            <span>1. Pessoal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'clinico'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-950/70 hover:bg-emerald-50 hover:text-emerald-900'
            )}
          >
            <HeartPulse className="size-4.5" />
            <span>2. Clínico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'habitos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-950/70 hover:bg-emerald-50 hover:text-emerald-900'
            )}
          >
            <Apple className="size-4.5" />
            <span>3. Hábitos</span>
          </button>
        </div>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit}>
          {/* ======================================================== */}
          {/* ABA 1 — PESSOAL                                          */}
          {/* ======================================================== */}
          {activeTab === 'pessoal' && (
            <Card className="border-emerald-100 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <User className="size-5 text-emerald-600" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>
                  Identificação do paciente e canais de contato.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Nome completo (obrigatório) */}
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-sm font-semibold text-emerald-950">
                    Nome completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria Carolina Silva"
                    required
                    className="border-emerald-200 focus-visible:ring-emerald-500 text-base"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Este é o único campo com preenchimento obrigatório.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Data de nascimento com cálculo automático de idade */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dataNascimento" className="text-sm font-medium text-emerald-950">
                        Data de nascimento
                      </Label>
                      {idadeCalculada !== null && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          {idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}
                        </span>
                      )}
                    </div>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      A idade do paciente é calculada automaticamente pelo sistema.
                    </p>
                  </div>

                  {/* Sexo (Feminino, Masculino, Outro) */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-emerald-950">
                      Sexo
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Feminino', 'Masculino', 'Outro'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSexo(opt)}
                          className={cn(
                            'flex items-center justify-center py-2 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer',
                            sexo === opt
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                              : 'border-emerald-100 bg-white text-emerald-950/80 hover:bg-emerald-50/50'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  {/* Telefone formatado */}
                  <div className="space-y-1.5">
                    <Label htmlFor="telefone" className="text-sm font-medium text-emerald-950">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* WhatsApp formatado */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp" className="text-sm font-medium text-emerald-950">
                        WhatsApp
                      </Label>
                      {telefone && (
                        <button
                          type="button"
                          onClick={() => setWhatsapp(telefone)}
                          className="text-[11px] text-emerald-600 hover:underline cursor-pointer"
                        >
                          Copiar do telefone
                        </button>
                      )}
                    </div>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatPhoneNumber(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-emerald-950">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="paciente@email.com"
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t border-emerald-50 pt-5">
                <span className="text-xs text-muted-foreground">Etapa 1 de 3</span>
                <Button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <span>Próximo: Clínico</span>
                  <ArrowRight className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ======================================================== */}
          {/* ABA 2 — CLÍNICO                                          */}
          {/* ======================================================== */}
          {activeTab === 'clinico' && (
            <Card className="border-emerald-100 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <HeartPulse className="size-5 text-emerald-600" />
                  Perfil Clínico e Antropométrico
                </CardTitle>
                <CardDescription>
                  Parâmetros corporais, objetivos e histórico de saúde do paciente.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Medidas Corporais e IMC */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Peso atual */}
                  <div className="space-y-1.5">
                    <Label htmlFor="peso" className="text-sm font-medium text-emerald-950">
                      Peso atual
                    </Label>
                    <div className="relative">
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        min="0"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        placeholder="Ex: 68.5"
                        className="pr-12 border-emerald-100 focus-visible:ring-emerald-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Altura em cm */}
                  <div className="space-y-1.5">
                    <Label htmlFor="altura" className="text-sm font-medium text-emerald-950">
                      Altura
                    </Label>
                    <div className="relative">
                      <Input
                        id="altura"
                        type="number"
                        step="1"
                        min="0"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                        placeholder="Ex: 168"
                        className="pr-12 border-emerald-100 focus-visible:ring-emerald-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* IMC calculado automaticamente pelo sistema */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-emerald-950 flex items-center gap-1.5">
                      <Scale className="size-3.5 text-emerald-600" />
                      IMC (calculado)
                    </Label>
                    <div className="flex h-9 items-center justify-between rounded-md border border-emerald-100 bg-emerald-50/40 px-3">
                      <span className="font-bold text-emerald-950">
                        {imcCalculado ? `${imcCalculado.imc} kg/m²` : '—'}
                      </span>
                      {imcCalculado && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold ring-1',
                            imcCalculado.colorBadge
                          )}
                        >
                          {imcCalculado.classification}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivo (Múltipla escolha + campo livre adicional) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-950">
                    Objetivos nutricionais
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {OBJETIVOS_PREDEFINIDOS.map((item) => {
                      const isSelected = objetivos.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setObjetivos(objetivos.filter((x) => x !== item))
                            } else {
                              setObjetivos([...objetivos, item])
                            }
                          }}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                              : 'border-emerald-100 bg-white text-emerald-950 hover:bg-emerald-50'
                          )}
                        >
                          {isSelected && <Check className="size-3.5" />}
                          <span>{item}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Campo de texto livre adicional para objetivos */}
                  <Input
                    value={objetivoTexto}
                    onChange={(e) => setObjetivoTexto(e.target.value)}
                    placeholder="Complemento livre sobre o objetivo (ex: foco na redução de gordura visceral para prova de ciclismo)..."
                    className="mt-2 border-emerald-100 focus-visible:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Nível de atividade física */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-950">
                    Nível de atividade física
                  </Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {NIVEIS_ATIVIDADE.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNivelAtividade(lvl)}
                        className={cn(
                          'flex items-center justify-center py-2 px-2 text-center rounded-lg border text-xs font-medium transition-all cursor-pointer',
                          nivelAtividade === lvl
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                            : 'border-emerald-100 bg-white text-emerald-950/80 hover:bg-emerald-50'
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patologias ou condições de saúde (+ Nenhum + Adicionar livremente) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-950">
                    Patologias ou condições de saúde
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayOption(patologias, setPatologias, 'Nenhum')
                      }
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                        patologias.includes('Nenhum')
                          ? 'border-emerald-700 bg-emerald-700 text-white font-semibold'
                          : 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50'
                      )}
                    >
                      {patologias.includes('Nenhum') && <Check className="size-3.5" />}
                      <span>Nenhum</span>
                    </button>

                    {PATOLOGIAS_PREDEFINIDAS.map((item) => {
                      const isSelected = patologias.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleArrayOption(patologias, setPatologias, item)
                          }
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                              : 'border-emerald-100 bg-white text-emerald-950 hover:bg-emerald-50'
                          )}
                        >
                          {isSelected && <Check className="size-3.5" />}
                          <span>{item}</span>
                        </button>
                      )
                    })}

                    {/* Exibe itens customizados adicionados livremente */}
                    {patologias
                      .filter(
                        (p) =>
                          p !== 'Nenhum' && !PATOLOGIAS_PREDEFINIDAS.includes(p)
                      )
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <span>{custom}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(patologias, setPatologias, custom)
                            }
                            className="cursor-pointer hover:text-emerald-200"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  {/* Campo para adicionar livremente */}
                  <div className="flex gap-2 pt-1 max-w-md">
                    <Input
                      value={novaPatologia}
                      onChange={(e) => setNovaPatologia(e.target.value)}
                      placeholder="Adicionar outra patologia..."
                      className="border-emerald-100 text-xs h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem(
                            patologias,
                            setPatologias,
                            novaPatologia,
                            () => setNovaPatologia('')
                          )
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addCustomItem(
                          patologias,
                          setPatologias,
                          novaPatologia,
                          () => setNovaPatologia('')
                        )
                      }
                      className="h-8 text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Restrições alimentares (+ Nenhum + Adicionar livremente) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-950">
                    Restrições alimentares
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayOption(restricoes, setRestricoes, 'Nenhum')
                      }
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                        restricoes.includes('Nenhum')
                          ? 'border-emerald-700 bg-emerald-700 text-white font-semibold'
                          : 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50'
                      )}
                    >
                      {restricoes.includes('Nenhum') && <Check className="size-3.5" />}
                      <span>Nenhum</span>
                    </button>

                    {RESTRICOES_PREDEFINIDAS.map((item) => {
                      const isSelected = restricoes.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleArrayOption(restricoes, setRestricoes, item)
                          }
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                              : 'border-emerald-100 bg-white text-emerald-950 hover:bg-emerald-50'
                          )}
                        >
                          {isSelected && <Check className="size-3.5" />}
                          <span>{item}</span>
                        </button>
                      )
                    })}

                    {restricoes
                      .filter(
                        (r) =>
                          r !== 'Nenhum' && !RESTRICOES_PREDEFINIDAS.includes(r)
                      )
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <span>{custom}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(restricoes, setRestricoes, custom)
                            }
                            className="cursor-pointer hover:text-emerald-200"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  <div className="flex gap-2 pt-1 max-w-md">
                    <Input
                      value={novaRestricao}
                      onChange={(e) => setNovaRestricao(e.target.value)}
                      placeholder="Adicionar outra restrição alimentar..."
                      className="border-emerald-100 text-xs h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem(
                            restricoes,
                            setRestricoes,
                            novaRestricao,
                            () => setNovaRestricao('')
                          )
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addCustomItem(
                          restricoes,
                          setRestricoes,
                          novaRestricao,
                          () => setNovaRestricao('')
                        )
                      }
                      className="h-8 text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Alergias alimentares (+ Nenhum + Adicionar livremente) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-950">
                    Alergias alimentares
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayOption(alergias, setAlergias, 'Nenhum')
                      }
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                        alergias.includes('Nenhum')
                          ? 'border-emerald-700 bg-emerald-700 text-white font-semibold'
                          : 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50'
                      )}
                    >
                      {alergias.includes('Nenhum') && <Check className="size-3.5" />}
                      <span>Nenhum</span>
                    </button>

                    {ALERGIAS_PREDEFINIDAS.map((item) => {
                      const isSelected = alergias.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleArrayOption(alergias, setAlergias, item)
                          }
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white font-semibold'
                              : 'border-emerald-100 bg-white text-emerald-950 hover:bg-emerald-50'
                          )}
                        >
                          {isSelected && <Check className="size-3.5" />}
                          <span>{item}</span>
                        </button>
                      )
                    })}

                    {alergias
                      .filter(
                        (a) =>
                          a !== 'Nenhum' && !ALERGIAS_PREDEFINIDAS.includes(a)
                      )
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <span>{custom}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(alergias, setAlergias, custom)
                            }
                            className="cursor-pointer hover:text-emerald-200"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  <div className="flex gap-2 pt-1 max-w-md">
                    <Input
                      value={novaAlergia}
                      onChange={(e) => setNovaAlergia(e.target.value)}
                      placeholder="Adicionar outra alergia alimentar..."
                      className="border-emerald-100 text-xs h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem(alergias, setAlergias, novaAlergia, () =>
                            setNovaAlergia('')
                          )
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addCustomItem(alergias, setAlergias, novaAlergia, () =>
                          setNovaAlergia('')
                        )
                      }
                      className="h-8 text-xs border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Medicamentos e Suplementos */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="medicamentos" className="text-sm font-medium text-emerald-950">
                      Medicamentos contínuos
                    </Label>
                    <textarea
                      id="medicamentos"
                      rows={2}
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                      placeholder="Ex: Levotiroxina 50mcg em jejum..."
                      className="w-full rounded-md border border-emerald-100 bg-white p-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="suplementos" className="text-sm font-medium text-emerald-950">
                      Suplementos em uso
                    </Label>
                    <textarea
                      id="suplementos"
                      rows={2}
                      value={suplementos}
                      onChange={(e) => setSuplementos(e.target.value)}
                      placeholder="Ex: Creatina 5g, Vitamina D3 2000UI..."
                      className="w-full rounded-md border border-emerald-100 bg-white p-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t border-emerald-50 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('pessoal')}
                  className="gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>Voltar: Pessoal</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setActiveTab('habitos')}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <span>Próximo: Hábitos</span>
                  <ArrowRight className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ======================================================== */}
          {/* ABA 3 — HÁBITOS                                          */}
          {/* ======================================================== */}
          {activeTab === 'habitos' && (
            <Card className="border-emerald-100 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Apple className="size-5 text-emerald-600" />
                  Rotina e Hábitos de Vida
                </CardTitle>
                <CardDescription>
                  Padrões de sono, hidratação, horários e atividade física.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Refeições por dia */}
                  <div className="space-y-1.5">
                    <Label htmlFor="refeicoes" className="text-sm font-medium text-emerald-950">
                      Refeições por dia
                    </Label>
                    <Input
                      id="refeicoes"
                      type="number"
                      min="1"
                      max="10"
                      value={refeicoesPorDia}
                      onChange={(e) => setRefeicoesPorDia(e.target.value)}
                      placeholder="Ex: 4"
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* Horário que acorda (auto-conversão: 6 → 06:00, 630 → 06:30) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="horarioAcorda" className="text-sm font-medium text-emerald-950">
                        Horário que acorda
                      </Label>
                      <Clock className="size-3.5 text-emerald-600" />
                    </div>
                    <Input
                      id="horarioAcorda"
                      value={horarioAcorda}
                      onChange={(e) => setHorarioAcorda(e.target.value)}
                      onBlur={() =>
                        handleHorarioBlur(horarioAcorda, setHorarioAcorda)
                      }
                      placeholder="Ex: 630 ou 06:30"
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Converte 6 → 06:00, 630 → 06:30
                    </p>
                  </div>

                  {/* Horário que dorme (auto-conversão: 23 → 23:00, 2230 → 22:30) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="horarioDorme" className="text-sm font-medium text-emerald-950">
                        Horário que dorme
                      </Label>
                      <Clock className="size-3.5 text-emerald-600" />
                    </div>
                    <Input
                      id="horarioDorme"
                      value={horarioDorme}
                      onChange={(e) => setHorarioDorme(e.target.value)}
                      onBlur={() =>
                        handleHorarioBlur(horarioDorme, setHorarioDorme)
                      }
                      placeholder="Ex: 2230 ou 23:00"
                      className="border-emerald-100 focus-visible:ring-emerald-500"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Converte 23 → 23:00, 2230 → 22:30
                    </p>
                  </div>

                  {/* Quantidade de água por dia (exibe litros automaticamente) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="agua" className="text-sm font-medium text-emerald-950">
                      Consumo de água
                    </Label>
                    <div className="relative">
                      <Input
                        id="agua"
                        type="number"
                        step="0.1"
                        min="0"
                        value={litrosAgua}
                        onChange={(e) => setLitrosAgua(e.target.value)}
                        placeholder="Ex: 2.5"
                        className="pr-16 border-emerald-100 focus-visible:ring-emerald-500"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700">
                        litros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pratica atividade física (Sim / Não — se sim, abre campo de texto) */}
                <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-emerald-950">
                        Pratica atividade física?
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Informe se o paciente realiza exercícios físicos regulares.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPraticaAtividadeFisica(true)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-all cursor-pointer',
                          praticaAtividadeFisica === true
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50'
                        )}
                      >
                        <Check className="size-3.5" />
                        <span>Sim</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPraticaAtividadeFisica(false)
                          setAtividadeFisicaDescricao('')
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-all cursor-pointer',
                          praticaAtividadeFisica === false
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50'
                        )}
                      >
                        <X className="size-3.5" />
                        <span>Não</span>
                      </button>
                    </div>
                  </div>

                  {/* Se sim, abre campo de texto: qual atividade e frequência semanal */}
                  {praticaAtividadeFisica === true && (
                    <div className="space-y-1.5 pt-2 animate-in fade-in-50 duration-200">
                      <Label
                        htmlFor="atividadeDescricao"
                        className="text-xs font-medium text-emerald-950"
                      >
                        Qual atividade física e frequência semanal?
                      </Label>
                      <Input
                        id="atividadeDescricao"
                        value={atividadeFisicaDescricao}
                        onChange={(e) =>
                          setAtividadeFisicaDescricao(e.target.value)
                        }
                        placeholder="Ex: Musculação (4x na semana) e Corrida aos sábados (5km)"
                        className="border-emerald-200 bg-white focus-visible:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Observações gerais (texto livre) */}
                <div className="space-y-1.5">
                  <Label htmlFor="observacoes" className="text-sm font-medium text-emerald-950">
                    Observações gerais
                  </Label>
                  <textarea
                    id="observacoes"
                    rows={3}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Informações adicionais relevantes, preferências do paciente, rotina de trabalho ou histórico..."
                    className="w-full rounded-md border border-emerald-100 bg-white p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t border-emerald-50 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('clinico')}
                  className="gap-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>Voltar: Clínico</span>
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar Paciente'}</span>
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}
