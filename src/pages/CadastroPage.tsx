import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { PasswordInput } from '@/components/PasswordInput'
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
import { cn } from '@/lib/utils'

const MIN_PASSWORD_LENGTH = 9

export function CadastroPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedName = nome.trim()
    const trimmedEmail = email.trim()

    if (trimmedName.length < 2) {
      setErrorMessage('Informe seu nome completo.')
      return
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Informe um endereço de e-mail válido.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
      )
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas informadas não coincidem.')
      return
    }

    setIsSubmitting(true)
    const { error } = await signUp(trimmedName, trimmedEmail, password)
    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout>
      <Card className="border-emerald-100/90 bg-white/95 shadow-xl shadow-emerald-950/5 backdrop-blur-sm">
        <CardHeader className="space-y-1.5 pb-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-emerald-950">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Comece a organizar consultas e planos alimentares com eficiência.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errorMessage && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50/80 text-red-800"
              >
                <AlertCircle className="size-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="cadastro-nome" className="text-emerald-950">
                Nome completo
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-600/70" />
                <Input
                  id="cadastro-nome"
                  type="text"
                  placeholder="Dra. Ana Paula Silva"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  className="h-10 pl-9"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cadastro-email" className="text-emerald-950">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-600/70" />
                <Input
                  id="cadastro-email"
                  type="email"
                  placeholder="seuemail@clinica.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  className="h-10 pl-9"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cadastro-password" className="text-emerald-950">
                Senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-emerald-600/70" />
                <PasswordInput
                  id="cadastro-password"
                  placeholder="Mínimo de 9 caracteres"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  className="h-10 pl-9"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <p
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  hasMinLength ? 'text-emerald-700' : 'text-muted-foreground'
                )}
              >
                <CheckCircle2
                  className={cn(
                    'size-3.5',
                    hasMinLength ? 'text-emerald-600' : 'text-muted-foreground/50'
                  )}
                />
                Mínimo de 9 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="cadastro-confirm-password"
                className="text-emerald-950"
              >
                Confirmar senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-emerald-600/70" />
                <PasswordInput
                  id="cadastro-confirm-password"
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  className="h-10 pl-9"
                  disabled={isSubmitting}
                  aria-invalid={
                    confirmPassword.length > 0 && !passwordsMatch
                  }
                  required
                />
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600">
                  As senhas ainda não coincidem.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="mt-2 h-10 w-full cursor-pointer bg-emerald-600 font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-emerald-50 pt-5 text-sm">
          <p className="text-muted-foreground">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
            >
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
