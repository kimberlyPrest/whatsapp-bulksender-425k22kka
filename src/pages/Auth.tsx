import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'
import useAppStore, { UserRole } from '@/stores/useAppStore'
import { Alert, AlertDescription } from '@/components/ui/alert'

const VALID_DOMAINS = ['@adapta.org', '@copyexperts.com.br']

export default function Auth() {
  const { login } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingName, setIsFetchingName] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const isValidDomain = VALID_DOMAINS.some((domain) => email.endsWith(domain))
  const showSignupWarning = email.length > 0 && email.includes('@') && !isValidDomain

  const handleEmailBlur = () => {
    if (isValidDomain && email) {
      setIsFetchingName(true)
      // Mocking /api/auth/owner-name
      setTimeout(() => {
        setName(email.split('@')[0].replace('.', ' '))
        setIsFetchingName(false)
      }, 600)
    }
  }

  const handleAuth = (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault()
    setError('')

    if (!isValidDomain) {
      setError('Domínio de email não autorizado.')
      return
    }

    if (isLogin && password !== 'senha123') {
      // Mock validation
      setError('Email ou senha incorretos')
      // Let it pass for testing purposes if it's admin/elite
      if (!email.includes('admin') && !email.includes('elite')) {
        return
      }
    }

    setIsLoading(true)

    // Mock role assignment based on email for testing
    let role: UserRole = 'Geral'
    if (email.includes('admin')) role = 'SuperAdmin'
    if (email.includes('elite')) role = 'Elite'

    setTimeout(() => {
      login({
        email,
        name: name || email.split('@')[0],
        role,
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://img.usecurling.com/p/1920/1080?q=abstract%20dark&color=green')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <Card className="w-full max-w-md relative z-10 animate-fade-in-up border-primary/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">
            BulkSender <span className="text-primary font-normal">Adapta</span>
          </CardTitle>
          <CardDescription>Evolution API Control Center</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@adapta.org"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-visible:ring-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Tip: Use admin@adapta.org, elite@adapta.org, or user@adapta.org to test roles.
                </p>
                <Button
                  type="submit"
                  className="w-full font-bold hover:scale-[1.02] transition-transform"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enter'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Work Email</Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@adapta.org"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      className="focus-visible:ring-primary pr-10"
                    />
                    {isFetchingName && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                {showSignupWarning && (
                  <Alert
                    variant="destructive"
                    className="bg-destructive/10 border-destructive/20 text-destructive animate-fade-in"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Domínio de email não autorizado para registro.
                    </AlertDescription>
                  </Alert>
                )}
                {isValidDomain && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="focus-visible:ring-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full font-bold hover:scale-[1.02] transition-transform"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
