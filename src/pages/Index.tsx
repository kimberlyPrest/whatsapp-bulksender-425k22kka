import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, Play, CalendarClock, Download } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MessageEditor } from '@/components/dispatch/MessageEditor'
import { AntiBanConfig } from '@/components/dispatch/AntiBanConfig'
import { ProgressView } from '@/components/dispatch/ProgressView'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { selectedContacts, setSelectedContacts } = useAppStore()
  const { toast } = useToast()

  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [logs, setLogs] = useState<
    { id: string; phone: string; status: 'success' | 'error'; time: string }[]
  >([])
  const [isScheduled, setIsScheduled] = useState(false)

  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSending && sentCount < selectedContacts.length) {
      interval = setInterval(() => {
        setSentCount((prev) => {
          const next = prev + 1
          const contact = selectedContacts[prev]
          if (contact) {
            setLogs((l) => [
              {
                id: Math.random().toString(),
                phone: contact.phone,
                status: Math.random() > 0.1 ? 'success' : 'error',
                time: new Date().toLocaleTimeString(),
              },
              ...l,
            ])
          }
          if (next >= selectedContacts.length) setIsSending(false)
          return next
        })
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isSending, sentCount, selectedContacts])

  const handleStart = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No contacts',
        description: 'Please load contacts first.',
        variant: 'destructive',
      })
      return
    }
    if (!message) {
      toast({
        title: 'Empty message',
        description: 'Please write a message template.',
        variant: 'destructive',
      })
      return
    }
    setIsSending(true)
    setSentCount(0)
    setLogs([])
  }

  const handleClear = () => {
    setSelectedContacts([])
    setSentCount(0)
    setLogs([])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">New Dispatch</h1>
          <p className="text-muted-foreground mt-1">Configure and launch your WhatsApp campaign.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-6 space-y-6">
              <Tabs defaultValue="csv" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                  <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
                </TabsList>
                <TabsContent value="csv">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/20 transition-colors cursor-pointer group">
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium">Drag and drop your CSV here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
                  </div>
                </TabsContent>
                <TabsContent value="sheets" className="space-y-4">
                  <Input placeholder="Paste Google Sheets URL here..." className="bg-background" />
                  <Button variant="secondary" className="w-full">
                    Load Data
                  </Button>
                </TabsContent>
              </Tabs>

              <MessageEditor message={message} setMessage={setMessage} />
              <AntiBanConfig />

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={(c) => setIsScheduled(!!c)}
                  />
                  <label
                    htmlFor="schedule"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <CalendarClock className="h-4 w-4" /> Schedule dispatch
                  </label>
                </div>
                {isScheduled && <Input type="datetime-local" className="w-auto h-8 text-sm" />}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {(isSending || sentCount > 0) && (
            <ProgressView
              total={selectedContacts.length}
              sent={sentCount}
              logs={logs}
              isSending={isSending}
            />
          )}

          <Card className="shadow-lg border-border/50">
            <CardContent className="p-0 flex flex-col h-[400px]">
              <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-semibold flex items-center gap-2">
                  Contacts Loaded
                  <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                    {selectedContacts.length}
                  </span>
                </h3>
                {selectedContacts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-background sticky top-0 z-10">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center h-32 text-muted-foreground">
                          No contacts loaded. Use the source panel or select from Clients.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedContacts.map((c, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
              onClick={handleStart}
              disabled={isSending || selectedContacts.length === 0}
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              {isSending ? 'Sending...' : 'Start Dispatch'}
            </Button>
            {sentCount > 0 && !isSending && (
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
