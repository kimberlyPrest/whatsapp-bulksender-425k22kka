import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Bot, Edit2, Trash2, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VariationsState = {
  status: 'idle' | 'approved' | 'original'
  data: string[]
}

interface Props {
  template: string
  contactsCount: number
  variations: VariationsState
  onChange: (val: VariationsState) => void
}

const LOADING_MSGS = [
  'Analisando sua mensagem...',
  'Criando variações naturais...',
  'Ajustando o tom de voz...',
  'Finalizando...',
]

export function MessageVariations({ template, contactsCount, variations, onChange }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)
  const [items, setItems] = useState<{ id: string; text: string; approved: boolean }[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const recommendedCount = contactsCount <= 100 ? 3 : contactsCount <= 500 ? 7 : 12

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_MSGS.length), 2000)
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleGenerate = () => {
    setIsGenerating(true)
    setLoadingStep(0)
    setTimeout(() => {
      const prefixes = ['Olá!', 'Oi, tudo bem?', 'Como vai?', 'Saudações!', 'Passando para avisar:']
      const generated = Array.from({ length: recommendedCount }).map((_, i) => ({
        id: Math.random().toString(),
        text: `${prefixes[i % prefixes.length]} ${template}`,
        approved: true,
      }))
      setItems(generated)
      setIsGenerating(false)
      setIsReviewing(true)
    }, 4000)
  }

  const handleSaveEdit = (id: string) => {
    const originalPlaceholders = Array.from(new Set(template.match(/\{[^}]+\}/g) || []))
    const missing = originalPlaceholders.filter((p) => !editValue.includes(p))
    if (missing.length > 0)
      return setEditError(`Placeholder(s) removido(s): ${missing.join(', ')}. Adicione de volta.`)
    setItems(items.map((it) => (it.id === id ? { ...it, text: editValue } : it)))
    setEditingId(null)
    setEditError(null)
  }

  const handleConfirm = () => {
    const approved = items.filter((it) => it.approved).map((it) => it.text)
    onChange(
      approved.length > 0
        ? { status: 'approved', data: approved }
        : { status: 'original', data: [] },
    )
    setIsReviewing(false)
  }

  const approvedCount = items.filter((it) => it.approved).length

  return (
    <div className="space-y-4 pt-6 border-t border-border mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-semibold text-primary flex items-center gap-2">
            <Bot className="w-5 h-5" /> Variações com IA
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Recomendado para {contactsCount} contatos:{' '}
            <strong className="text-foreground">{recommendedCount} variações</strong>.
          </p>
        </div>
        <Button onClick={handleGenerate} className="gap-2 relative z-10">
          <Bot className="w-4 h-4" /> Gerar com IA
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {variations.status === 'approved' && (
          <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-green-500/30 px-3 py-1.5 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {variations.data.length} variações aprovadas —
            enviando aleatoriamente
            <button
              onClick={() => onChange({ status: 'idle', data: [] })}
              className="ml-1 hover:bg-green-500/20 rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {variations.status === 'original' && (
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm flex items-center gap-2 border-border"
          >
            Usando template original
            <button
              onClick={() => onChange({ status: 'idle', data: [] })}
              className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
      </div>

      <Dialog open={isGenerating} onOpenChange={(o) => !o && setIsGenerating(false)}>
        <DialogContent
          id="modal-ai-loading"
          className="sm:max-w-md flex flex-col items-center justify-center p-8 text-center"
        >
          <Bot className="w-16 h-16 text-primary animate-bounce mb-4" />
          <DialogTitle className="text-xl mb-2">Gerando variações...</DialogTitle>
          <p className="text-muted-foreground animate-fade-in-up" key={loadingStep}>
            {LOADING_MSGS[loadingStep]}
          </p>
          <Button variant="ghost" className="mt-6" onClick={() => setIsGenerating(false)}>
            Cancelar
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle>Variações de Mensagem</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Revise as variações. As aprovadas serão usadas no disparo.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary/5 custom-scrollbar">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  it.approved
                    ? 'bg-primary/5 border-primary/30 shadow-sm'
                    : 'bg-background border-border opacity-70',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Variação {idx + 1} de {items.length}
                  </span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={it.approved}
                      onCheckedChange={(c) =>
                        setItems(items.map((x) => (x.id === it.id ? { ...x, approved: c } : x)))
                      }
                    />
                    <span className="text-sm font-medium w-16">
                      {it.approved ? 'Aprovada' : 'Ignorada'}
                    </span>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => {
                        setEditingId(it.id)
                        setEditValue(it.text)
                        setEditError(null)
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setItems(items.filter((x) => x.id !== it.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {editingId === it.id ? (
                  <div className="space-y-2 animate-fade-in">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="min-h-[100px]"
                    />
                    {editError && (
                      <p className="text-sm text-destructive font-medium">{editError}</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(it.id)}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{it.text}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="p-4 border-t bg-background flex sm:justify-between items-center gap-4 shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItems(items.map((it) => ({ ...it, approved: true })))}
              >
                Aprovar todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItems(items.map((it) => ({ ...it, approved: false })))}
              >
                Limpar
              </Button>
            </div>
            <Button onClick={handleConfirm}>
              {approvedCount > 0
                ? `Usar ${approvedCount} variações aprovadas`
                : 'Manter template original'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
