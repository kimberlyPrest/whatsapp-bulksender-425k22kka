import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { Send, Users, HistoryIcon, Settings, ShieldAlert, LogOut, Menu } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import Auth from '@/pages/Auth'
import { Button } from '@/components/ui/button'

const MobileTopBar = () => {
  const { toggleSidebar } = useSidebar()
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar glass-effect sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-primary" />
        <span className="font-bold">BulkSender</span>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAppStore()
  const location = useLocation()

  if (!user) {
    return <Auth />
  }

  const navItems = [
    { name: 'New Dispatch', path: '/', icon: Send },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Configuration', path: '/config', icon: Settings },
    { name: 'Admin', path: '/admin', icon: ShieldAlert },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">BulkSender</h2>
                <p className="text-xs text-muted-foreground font-medium">Adapta · Evolution API</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu className="gap-2 px-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors py-5"
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium text-base">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <div className="mb-4 px-2">
              <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
              <p className="text-sm font-medium truncate">{user}</p>
            </div>
            <Button
              variant="destructive"
              className="w-full justify-start gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-transparent hover:border-destructive/30"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0">
          <MobileTopBar />
          <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
