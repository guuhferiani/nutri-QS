import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react'
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

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Informe um endereço de e-mail válido.')
      return
    }

    if (!password) {
      setErrorMessage('Informe sua senha para entrar.')
      return
    }

    setIsSubmitting(true)
    const { error } = await signIn(trimmedEmail, password)
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
            Acesse sua conta
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Entre com seu e-mail e senha para acessar o consultório.
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
              <Label htmlFor="login-email" className="text-emerald-950">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-600/70" />
                <Input
                  id="login-email"
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
              <Label htmlFor="login-password" className="text-emerald-950">
                Senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-emerald-600/70" />
                <PasswordInput
                  id="login-password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
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
            </div>

            <Button
              type="submit"
              className="mt-2 h-10 w-full cursor-pointer bg-emerald-600 font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-emerald-50 pt-5 text-sm">
          <p className="text-muted-foreground">
            Não tem conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
