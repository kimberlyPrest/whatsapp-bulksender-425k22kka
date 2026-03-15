import { useState, useEffect } from 'react'
import { Plus, Smartphone, Trash2, AlertCircle, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface WhatsAppInstance {
  id: string
  displayName: string
  apiUrl: string
  apiKey: string
  instanceName: string
  active: boolean
}

const MOCK_INSTANCES: WhatsAppInstance[] = [
  {
    id: '1',
    displayName: 'Número Principal',
    apiUrl: 'https://api.bulksender.adapta.org',
    apiKey: 'sk_live_123',
    instanceName: 'main-instance',
    active: true,
  },
]

export default function WhatsAppInstances() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    displayName: '',
    apiUrl: '',
    apiKey: '',
    instanceName: '',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setInstances(MOCK_INSTANCES)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const openModal = (inst?: WhatsAppInstance) => {
    setEditingId(inst?.id || null)
    setFormData({
      displayName: inst?.displayName || '',
      apiUrl: inst?.apiUrl || '',
      apiKey: '', // Don't show existing key
      instanceName: inst?.instanceName || '',
    })
    setError(null)
    setIsDeleting(false)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.displayName || !formData.apiUrl || !formData.instanceName) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    if (!editingId && !formData.apiKey) {
      setError('A API Key é obrigatória para novos números.')
      return
    }

    if (editingId) {
      setInstances((prev) =>
        prev.map((i) =>
          i.id === editingId ? { ...i, ...formData, apiKey: formData.apiKey || i.apiKey } : i,
        ),
      )
    } else {
      setInstances([...instances, { ...formData, id: Date.now().toString(), active: true }])
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    setInstances((prev) => prev.filter((i) => i.id !== editingId))
    setIsModalOpen(false)
  }

  const handleToggleActive = () => {
    setInstances((prev) => prev.map((i) => (i.id === editingId ? { ...i, active: !i.active } : i)))
    setIsModalOpen(false)
  }

  return (
    <Card className="shadow-md border-border/50 bg-background">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <div>
            <h2 className="text-xl font-bold">Números WhatsApp</h2>
            <p className="text-sm text-muted-foreground">Gerencie suas instâncias de envio</p>
          </div>
        </div>
        <Button
          onClick={() => openModal()}
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Adicionar número
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div id="instances-list" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              Carregando...
            </div>
          ) : instances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum número configurado.</div>
          ) : (
            instances.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      inst.active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      {inst.displayName}
                      {!inst.active && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Desativado
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {inst.instanceName}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openModal(inst)}>
                  Editar
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="backdrop-blur-sm sm:max-w-md bg-background border-border shadow-2xl z-50">
          <DialogHeader>
            <DialogTitle id="instance-modal-title">
              {editingId ? 'Editar Número' : 'Adicionar Número'}
            </DialogTitle>
          </DialogHeader>

          <input type="hidden" id="inst-editing-id" value={editingId || ''} />

          {error && (
            <div
              id="instance-modal-error"
              className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome de exibição</Label>
              <Input
                placeholder="Ex: Número Principal"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="bg-secondary/30"
              />
            </div>
            <div className="space-y-2">
              <Label>URL da API</Label>
              <Input
                placeholder="https://sua-instancia.exemplo.com"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                className="bg-secondary/30"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="bg-secondary/30"
              />
              {editingId && (
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter a chave atual.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nome da Instância</Label>
              <Input
                placeholder="minha-instancia"
                value={formData.instanceName}
                onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                className="bg-secondary/30"
              />
            </div>
          </div>

          {isDeleting ? (
            <div
              id="instance-delete-confirm"
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3 mt-4 animate-in slide-in-from-bottom-2"
            >
              <p className="text-sm font-medium text-red-500 text-center">
                Apagar definitivamente? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  className="text-slate-300 border-slate-700 hover:bg-slate-800"
                  onClick={() => setIsDeleting(false)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Confirmar apagar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between mt-4 items-center">
              <div className="flex gap-2">
                {editingId && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleActive}
                      title="Ativar/Desativar"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsDeleting(true)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
