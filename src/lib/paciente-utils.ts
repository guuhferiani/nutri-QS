/**
 * Utilitários para formatação e cálculos do prontuário e cadastro de pacientes (Prompt 4)
 */

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function calculateAge(birthDateStr: string | null | undefined): number | null {
  if (!birthDateStr) return null
  const [year, month, day] = birthDateStr.split('-').map(Number)
  if (!year || !month || !day) return null
  const birth = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

/**
 * Converte número para formato de hora:
 * 6 → "06:00"
 * 630 → "06:30"
 * 23 → "23:00"
 * 2230 → "22:30"
 */
export function convertNumberToTime(val: string | number | null | undefined): string {
  if (val === '' || val === null || val === undefined) return ''
  // Se já tiver formato HH:mm, retorna diretamente
  const stringVal = String(val).trim()
  if (/^\d{2}:\d{2}$/.test(stringVal)) {
    return stringVal
  }

  const str = stringVal.replace(/\D/g, '')
  if (!str) return ''

  if (str.length === 1) {
    const h = Math.min(23, parseInt(str, 10))
    return `${h.toString().padStart(2, '0')}:00`
  }
  if (str.length === 2) {
    const h = parseInt(str, 10)
    if (h < 24) {
      return `${h.toString().padStart(2, '0')}:00`
    }
    // caso 63 -> 06:30
    return `0${str[0]}:${str[1]}0`
  }
  if (str.length === 3) {
    const h = parseInt(str.slice(0, 1), 10)
    const m = Math.min(59, parseInt(str.slice(1), 10))
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }
  if (str.length >= 4) {
    const h = Math.min(23, parseInt(str.slice(0, 2), 10))
    const m = Math.min(59, parseInt(str.slice(2, 4), 10))
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }
  return stringVal
}

export interface ImcResult {
  imc: number
  classification: string
  colorBadge: string
}

export function calculateImc(
  pesoKg: number | string | null | undefined,
  alturaCmOrM: number | string | null | undefined
): ImcResult | null {
  if (!pesoKg || !alturaCmOrM) return null
  const peso = typeof pesoKg === 'string' ? parseFloat(pesoKg.replace(',', '.')) : pesoKg
  const alturaRaw = typeof alturaCmOrM === 'string' ? parseFloat(alturaCmOrM.replace(',', '.')) : alturaCmOrM

  if (isNaN(peso) || isNaN(alturaRaw) || peso <= 0 || alturaRaw <= 0) return null

  // Altura em metros
  const alturaM = alturaRaw > 3 ? alturaRaw / 100 : alturaRaw
  const imc = peso / (alturaM * alturaM)
  const rounded = Number(imc.toFixed(1))

  let classification = ''
  let colorBadge = ''

  if (rounded < 18.5) {
    classification = 'Abaixo do peso'
    colorBadge = 'bg-amber-50 text-amber-700 ring-amber-200'
  } else if (rounded < 25) {
    classification = 'Peso normal'
    colorBadge = 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  } else if (rounded < 30) {
    classification = 'Sobrepeso'
    colorBadge = 'bg-amber-50 text-amber-800 ring-amber-300'
  } else if (rounded < 35) {
    classification = 'Obesidade grau I'
    colorBadge = 'bg-orange-50 text-orange-700 ring-orange-200'
  } else if (rounded < 40) {
    classification = 'Obesidade grau II'
    colorBadge = 'bg-red-50 text-red-700 ring-red-200'
  } else {
    classification = 'Obesidade grau III'
    colorBadge = 'bg-red-100 text-red-900 ring-red-300'
  }

  return {
    imc: rounded,
    classification,
    colorBadge,
  }
}
