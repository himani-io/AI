import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import SidebarLeft from "@/components/SidebarLeft"
import ChatSection from "@/components/ChatSection"
import { ThemeProvider } from "@/components/theme-provider"
import Toggle from "@/components/Toggle"

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <SidebarProvider>
          <SidebarLeft />

          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />

              <div className="flex flex-col leading-tight">
                <h1 className="text-sm font-semibold tracking-tight">Genie</h1>
                <p className="text-xs text-muted-foreground">
                  Your wish is my prompt
                </p>
              </div>

              <div className="ml-auto">
                <Toggle />
              </div>
            </header>

            <ChatSection />
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
