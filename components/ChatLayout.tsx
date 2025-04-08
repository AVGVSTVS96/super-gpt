'use client';

import { ReactNode } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { MessageSquare, Settings, User } from 'lucide-react';
import { ModelSelector } from '@/components/ChatUI/ModelSelector';
import { ModelProvider } from '@/components/ChatUI/ModelContext';

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ModelProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="flex h-14 items-center border-b px-4">
              {/* <h2 className="text-lg font-semibold">Super GPT</h2> */}
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Messages</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>New Chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Message history will be populated here */}
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat 1</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat 2</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="flex h-14 items-start justify-end border-t px-4">
              <p className="text-xs text-muted-foreground">© 2024 Super GPT</p>
            </SidebarFooter>
          </Sidebar>
          <div className="flex-grow flex flex-col">
            <div className="sticky top-0 z-10">
              <div className="flex h-14 items-center border-b px-4">
                <SidebarTrigger />
                <div className="ml-2">
                  <ModelSelector />
                </div>
              </div>
            </div>
            <main className="flex-grow overflow-hidden">
              <div className="p-4 h-[100dvh] content-center">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ModelProvider>
  );
} 