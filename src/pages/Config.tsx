import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Config() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [mappingModalOpen, setMappingModalOpen] = useState(false)

  // API State
  const [evoUrl, setEvoUrl] = useState('https://evo.adapta.org')
  const [evoKey, setEvoKey] = useState('sk_live_123456789')
  const [evoInstance, setEvoInstance] = useState('Adapta_Main_WP')
  const [googleJson, setGoogleJson] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Mock mappings
  const [mappings, setMappings] = useState([
    { id: '81963654', email: 'kimberly@adapta.org' },
    { id: '81963655', email: 'matheus@adapta.org' },
  ])
  const [newMapping, setNewMapping] = useState({ id: '', email: '' })

  const isGoogleConfigured = googleJson && isValidJson(googleJson)

  function isValidJson(str: string) {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText('https://api.bulksender.adapta.org/webhook/hs-xyz123')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (!evoUrl || !evoKey || !evoInstance) {
      setFeedback({ type: 'error', msg: 'Preencha todos os campos da Evolution API.' })
      return
    }
    if (googleJson && !isValidJson(googleJson)) {
      setFeedback({ type: 'error', msg: 'JSON do Google Credentials inválido.' })
      return
    }
    setFeedback({ type: 'success', msg: 'Configurações salvas com sucesso!' })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleAddMapping = () => {
    if (!/^\d+$/.test(newMapping.id)) {
      toast({
        title: 'Erro de Validação',
        description: 'O HubSpot ID deve conter apenas números.',
        variant: 'destructive',
      })
      return
    }
    if (newMapping.id && newMapping.email) {
      setMappings([...mappings, newMapping])
      setNewMapping({ id: '', email: '' })
      setMappingModalOpen(false)
      toast({ title: 'Mapeamento adicionado com sucesso.' })
    }
  }

  const removeMapping = (idx: number) => {
    setMappings(mappings.filter((_, i) => i !== idx))
  }

  const canSeeAdvanced = user?.role === 'SuperAdmin' || user?.role === 'Elite'

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuração</h1>
          <p className="text-muted-foreground mt-1">Gerencie integrações e credenciais da API.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 font-bold shadow-lg shadow-primary/20">
          <Save className="w-4 h-4" /> Salvar Alterações
        </Button>
      </div>

      {feedback && (
        <div
          className={cn(
            'p-4 rounded-md font-medium text-sm border animate-in slide-in-from-top-2',
            feedback.type === 'success'
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : 'bg-red-500/10 text-red-600 border-red-500/20',
          )}
        >
          {feedback.msg}
        </div>
      )}

      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="flex w-full mb-6 bg-secondary/50 p-1">
          <TabsTrigger value="evolution" className="flex-1">
            Evolution API
          </TabsTrigger>
          {canSeeAdvanced && (
            <TabsTrigger value="hubspot" className="flex-1">
              HubSpot
            </TabsTrigger>
          )}
          {user?.role === 'SuperAdmin' && (
            <TabsTrigger value="google" className="flex-1">
              Google Sheets
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="evolution">
          <Card className="shadow-md border-border/50">
            <CardHeader>
              <CardTitle>Evolution API Connection</CardTitle>
              <CardDescription>Connect to your WhatsApp instance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Evolution API URL</Label>
                <Input
                  value={evoUrl}
                  onChange={(e) => setEvoUrl(e.target.value)}
                  className="font-mono text-sm bg-background"
                  readOnly={user?.role === 'Geral'}
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={evoKey}
                  onChange={(e) => setEvoKey(e.target.value)}
                  className="font-mono text-sm bg-background"
                  readOnly={user?.role === 'Geral'}
                />
              </div>
              <div className="space-y-2">
                <Label>Instância</Label>
                <Input
                  value={evoInstance}
                  onChange={(e) => setEvoInstance(e.target.value)}
                  className="font-mono text-sm bg-background"
                  readOnly={user?.role === 'Geral'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'SuperAdmin' && (
          <TabsContent value="google">
            <Card className="shadow-md border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Google Service Account</CardTitle>
                  <CardDescription className="mt-1">
                    Cole o JSON de credenciais para leitura de planilhas
                  </CardDescription>
                </div>
                {isGoogleConfigured && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 font-medium">
                    Credenciais Google configuradas
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <Textarea
                  value={googleJson}
                  onChange={(e) => setGoogleJson(e.target.value)}
                  placeholder={`{\n  "type": "service_account",\n  "project_id": "..."\n}`}
                  className="font-mono text-xs min-h-[250px] bg-background border-border resize-none"
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canSeeAdvanced && (
          <TabsContent value="hubspot" className="space-y-6">
            <Card className="shadow-md border-border/50">
              <CardHeader>
                <CardTitle>Webhook Setup</CardTitle>
                <CardDescription>
                  Use this URL in your HubSpot workflows to trigger dispatches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value="https://api.bulksender.adapta.org/webhook/hs-xyz123"
                    className="font-mono text-sm bg-secondary/30 text-muted-foreground"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="w-24 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mapeamento de Proprietários</CardTitle>
                  <CardDescription className="mt-1">
                    Vincule os IDs do HubSpot com os emails do sistema
                  </CardDescription>
                </div>
                <Button onClick={() => setMappingModalOpen(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Novo Mapeamento
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mappings.map((mapping, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-secondary/20 rounded-md border border-border"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">HubSpot ID</p>
                        <p className="font-mono text-sm">{mapping.id}</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">Email Interno</p>
                        <p className="font-medium text-sm">{mapping.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMapping(idx)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {mappings.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhum mapeamento configurado.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={mappingModalOpen} onOpenChange={setMappingModalOpen}>
        <DialogContent className="backdrop-blur-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Mapeamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ID do Proprietário no HubSpot</Label>
              <Input
                placeholder="ex: 81963654"
                value={newMapping.id}
                onChange={(e) => setNewMapping({ ...newMapping, id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email no sistema</Label>
              <Input
                placeholder="ex: kimberly@adapta.org"
                type="email"
                value={newMapping.email}
                onChange={(e) => setNewMapping({ ...newMapping, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMapping} disabled={!newMapping.id || !newMapping.email}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
