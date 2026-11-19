interface AuthErrorLike {
  code?: string
  message?: string
  status?: number
  statusText?: string
}

/**
 * Converte códigos e mensagens de erro do Neon Auth / Better Auth
 * em mensagens claras e amigáveis em português para o usuário.
 */
export function getFriendlyAuthErrorMessage(
  error: unknown,
  context: 'login' | 'signup'
): string {
  const err = (error ?? {}) as AuthErrorLike
  const code = (err.code ?? '').toUpperCase()
  const message = (err.message ?? '').toLowerCase()

  if (
    code === 'INVALID_EMAIL_OR_PASSWORD' ||
    code === 'INVALID_CREDENTIALS' ||
    message.includes('invalid email or password') ||
    message.includes('invalid credentials') ||
    err.status === 401
  ) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.'
  }

  if (
    code === 'USER_ALREADY_EXISTS' ||
    code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' ||
    code === 'EMAIL_EXISTS' ||
    message.includes('already exists') ||
    message.includes('already registered')
  ) {
    return 'Já existe uma conta cadastrada com este e-mail. Tente fazer login.'
  }

  if (
    code === 'PASSWORD_TOO_SHORT' ||
    code === 'WEAK_PASSWORD' ||
    message.includes('password is too short') ||
    message.includes('at least')
  ) {
    return 'A senha deve ter no mínimo 9 caracteres.'
  }

  if (
    code === 'INVALID_EMAIL' ||
    code === 'EMAIL_ADDRESS_INVALID' ||
    message.includes('invalid email')
  ) {
    return 'Informe um endereço de e-mail válido.'
  }

  if (
    code === 'TOO_MANY_REQUESTS' ||
    err.status === 429 ||
    message.includes('too many')
  ) {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.'
  }

  if (
    code === 'EMAIL_NOT_VERIFIED' ||
    message.includes('email not verified')
  ) {
    return 'Seu e-mail ainda não foi verificado. Confira sua caixa de entrada.'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('load failed')
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  }

  if (context === 'login') {
    return 'Não foi possível entrar na sua conta. Verifique seu e-mail e senha e tente novamente.'
  }

  return 'Não foi possível concluir seu cadastro. Revise os dados informados e tente novamente.'
}

