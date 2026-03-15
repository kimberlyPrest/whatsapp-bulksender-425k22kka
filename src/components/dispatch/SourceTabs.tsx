import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

export function SourceTabs() {
  const { setSelectedContacts, setSourceType, setSourceFilename, sheetUrl, setSheetUrl } =
    useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleSheetLoad = async () => {
    if (!sheetUrl) return
    setLoading(true)
    const res = await api.loadFromSheets(sheetUrl)
    setSelectedContacts(res.contacts)
    setSourceType('sheets')
    setSourceFilename('Google Sheets')
    toast({ title: 'Planilha Carregada', description: `${res.contacts.length} contatos prontos.` })
    setLoading(false)
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const res = await api.uploadCsv(file)
    setFileName(res.filename)
    setSelectedContacts(res.contacts)
    setSourceType('csv')
    setSourceFilename(res.filename)
    toast({ title: 'CSV Carregado', description: `${res.contacts.length} contatos lidos.` })
    setLoading(false)
  }

  return (
    <Tabs defaultValue="csv" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary/40">
        <TabsTrigger value="csv">Upload CSV</TabsTrigger>
        <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
      </TabsList>
      <TabsContent value="csv">
        <div className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/20 transition-colors cursor-pointer group">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          {loading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
          ) : fileName ? (
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary" />
          ) : (
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          <p className="text-sm font-medium">
            {fileName ? `✓ ${fileName}` : 'Arraste ou clique para enviar CSV'}
          </p>
        </div>
      </TabsContent>
      <TabsContent value="sheets" className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cole a URL da planilha aqui..."
              className="bg-background pl-9"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={handleSheetLoad} disabled={loading || !sheetUrl}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Carregar'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
