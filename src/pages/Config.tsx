import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, Save } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function Config() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('https://api.bulksender.adapta.org/webhook/hs-xyz123')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    toast({ title: 'Configuration Saved', description: 'Your settings have been updated successfully.', className: 'bg-primary text-primary-foreground border-none' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground mt-1">System integrations and API settings.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 font-bold shadow-lg shadow-primary/20"><Save className="w-4 h-4" /> Save Changes</Button>
      </div>

      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
          <TabsTrigger value="google">Google Sheets</TabsTrigger>
          <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="evolution">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Evolution API Connection</CardTitle>
              <CardDescription>Connect to your WhatsApp instance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API URL</Label>
                <Input defaultValue="https://evo.adapta.org" className="font-mono text-sm bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Global API Key</Label>
                <Input type="password" defaultValue="sk_live_123456789" className="font-mono text-sm bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Instance Name</Label>
                <Input defaultValue="Adapta_Main_WP" className="font-mono text-sm bg-background" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Google Service Account</CardTitle>
              <CardDescription>Paste your credentials JSON to read Google Sheets</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="{&#10;  \"type\": \"service_account\",&#10;  \"project_id\": \"...\"&#10;}" 
                className="font-mono text-xs min-h-[250px] bg-background border-border resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hubspot">
          <Card className="shadow-md mb-6">
            <CardHeader>
              <CardTitle>Webhook Setup</CardTitle>
              <CardDescription>Use this URL in your HubSpot workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input readOnly value="https://api.bulksender.adapta.org/webhook/hs-xyz123" className="font-mono text-sm bg-secondary/50 text-muted-foreground" />
                <Button variant="outline" onClick={handleCopy} className="w-24 border-primary/30 text-primary hover:bg-primary/10">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Owner Mapping</CardTitle>
              <CardDescription>Map HubSpot owner names to local system users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <Input placeholder="HubSpot Name (e.g. John Doe)" className="flex-1 bg-background" />
                  <span className="text-muted-foreground">→</span>
                  <Input placeholder="System Email (e.g. john@adapta.org)" className="flex-1 bg-background" />
                </div>
              ))}
              <Button variant="secondary" size="sm" className="mt-2">+ Add Row</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
