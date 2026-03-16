import { useState } from 'react'
import { Plus, Smartphone, Trash2, AlertCircle, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn, esc } from '@/lib/utils'
import useAppStore, { WhatsAppInstance } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { QrModal } from './QrModal'

export default function WhatsAppInstances() {
  const { instances, setInstances } = useAppStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrInstance, setQrInstance] = useState<WhatsAppInstance | null>(null)

  const [formData, setFormData] = useState({
    display_name: '',
    api_url: '',
    api_key: '',
    instance_name: '',
  })

  const openModal = (inst?: WhatsAppInstance) => {
    setEditingId(inst?.id || null)
    setFormData({
      display_name: inst?.display_name || '',
      api_url: inst?.api_url || '',
      api_key: '',
      instance_name: inst?.instance_name || '',
    })
    setError(null)
    setIsDeleting(false)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.display_name || !formData.api_url || !formData.instance_name) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (editingId) {
      setInstances(
        instances.map((i) =>
          i.id === editingId ? { ...i, ...formData, api_key: formData.api_key || i.api_key } : i,
        ),
      )
    } else {
      const newId = Date.now().toString()
      setInstances([
        ...instances,
        {
          ...formData,
          id: newId,
          provider: 'Evolution API',
          status: 'pending_qr',
          is_active: true,
        },
      ])
    }
    setIsModalOpen(false)
  }

  const handleDelete = async () => {
    if (!editingId) return
    await fetch(`/api/whatsapp/instances/${editingId}/hard`, { method: 'DELETE' }).catch(() => {
      // ignore error
    })
    setInstances(instances.filter((i) => i.id !== editingId))
    setIsModalOpen(false)
  }

  const handleToggleActive = async () => {
    if (!editingId) return
    await fetch(`/api/whatsapp/instances/${editingId}`, { method: 'DELETE' }).catch(() => {
      // ignore error
    })
    setInstances(instances.map((i) => (i.id === editingId ? { ...i, is_active: !i.is_active } : i)))
    setIsModalOpen(false)
  }

  const verifyInstance = async (inst: WhatsAppInstance) => {
    try {
      const res = await api.checkInstanceStatus(inst.id)
      if (res.status === 'connected') {
        toast({ title: 'Sucesso', description: 'Instância conectada.' })
      } else {
        toast({ title: 'Atenção', description: 'Instância desconectada.', variant: 'destructive' })
      }
      setInstances(instances.map((i) => (i.id === inst.id ? { ...i, status: res.status } : i)))
    } catch (e) {
      // ignore error
    }
  }

  const getStatusDot = (status: string) => {
    if (status === 'connected') return 'bg-green-500'
    if (status === 'pending_qr') return 'bg-yellow-500 animate-pulse'
    return 'bg-slate-500'
  }

  return (
    <Card className="shadow-md border-border/50 bg-background">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h2 className="text-xl font-bold">Números WhatsApp</h2>
          <p className="text-sm text-muted-foreground">Gerencie suas instâncias de envio</p>
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
        <div className="space-y-4">
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
                  <div className="relative">
                    <div
                      className={cn(
                        'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background z-10',
                        getStatusDot(inst.status),
                      )}
                    />
                    <div
                      className={cn(
                        'p-2 rounded-full',
                        inst.is_active
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Smartphone className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      {esc(inst.display_name)}
                      {!inst.is_active && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 text-red-500 bg-red-500/10 border-red-500/20"
                        >
                          Inativo
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {esc(inst.provider || 'Evolution')} •{' '}
                      <span className="font-mono">{esc(inst.instance_name)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {inst.status !== 'connected' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
                      onClick={() => setQrInstance(inst)}
                    >
                      Conectar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-slate-700 hover:bg-slate-600 text-slate-300"
                      onClick={() => verifyInstance(inst)}
                    >
                      Verificar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openModal(inst)}>
                    Editar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="backdrop-blur-sm sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Número' : 'Adicionar Número'}</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome de exibição</Label>
              <Input
                placeholder="Ex: Número Principal"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL da API</Label>
              <Input
                placeholder="https://sua-instancia.exemplo.com"
                value={formData.api_url}
                onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
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
                value={formData.instance_name}
                onChange={(e) => setFormData({ ...formData, instance_name: e.target.value })}
              />
            </div>
          </div>

          {isDeleting ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3 mt-4">
              <p className="text-sm font-medium text-red-500 text-center">
                Apagar definitivamente? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setIsDeleting(false)}>
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
                <Button onClick={handleSave}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <QrModal instance={qrInstance} onClose={() => setQrInstance(null)} />
    </Card>
  )
}
