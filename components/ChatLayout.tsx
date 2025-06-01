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
  SidebarGroupLabel,
  SidebarMenuAction // Added for delete button
} from '@/components/ui/sidebar';
import { MessageSquare, Settings, User, PlusCircle, Trash2 } from 'lucide-react'; // Make sure all are imported
import { ModelSelector } from '@/components/ChatUI/ModelSelector';
import { ModelProvider } from '@/components/ChatUI/ModelContext';
import { useChatThreadContext } from '@/components/context/ChatThreadContext'; // Import the context hook
import { cn } from '@/lib/utils'; // For conditional class names

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const {
    threads,
    currentThreadId,
    selectThread,
    createNewThread,
    deleteThread,
    isLoadingThreads
  } = useChatThreadContext();

  const handleCreateNewChat = () => {
    const newThreadId = createNewThread();
    selectThread(newThreadId);
  };

  return (
    <ModelProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="flex h-14 items-center justify-between border-b px-4">
              {/* Optional: Add a title or logo here */}
              <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Chats</h2>
              <SidebarMenuButton
                size="sm"
                className="group-data-[collapsible=icon]:ml-0 ml-auto"
                onClick={handleCreateNewChat}
                tooltip="New Chat (Ctrl+N)" // Assuming tooltip prop exists or can be added
              >
                <PlusCircle className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">New</span>
              </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Messages</SidebarGroupLabel>
                {isLoadingThreads ? (
                  <SidebarMenu>
                    {[1, 2, 3].map((i) => (
                      <SidebarMenuItem key={i}>
                        <SidebarMenuButton disabled className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="w-20 h-4 bg-gray-200 animate-pulse rounded"></span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                ) : (
                  <SidebarMenu>
                    {threads.length === 0 && (
                       <SidebarMenuItem>
                         <div className="p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                           No chats yet.
                         </div>
                       </SidebarMenuItem>
                    )}
                    {threads.map((thread) => (
                      <SidebarMenuItem key={thread.id}>
                        <SidebarMenuButton
                          onClick={() => selectThread(thread.id)}
                          isActive={thread.id === currentThreadId}
                          className={cn(
                            "flex items-center justify-between gap-2 w-full",
                            thread.id === currentThreadId && "bg-accent" // Example active class
                          )}
                          tooltip={thread.title}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">{thread.title}</span>
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent selectThread on button click
                              if (confirm('Are you sure you want to delete this chat?')) {
                                deleteThread(thread.id);
                              }
                            }}
                            className="group-data-[collapsible=icon]:hidden"
                            aria-label="Delete chat"
                            tooltip="Delete Chat"
                          >
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                          </SidebarMenuAction>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </SidebarGroup>
              {/* Keep other settings groups if they exist, or remove if not needed */}
              <SidebarGroup className="mt-auto"> {/* Pushes settings to bottom */}
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2" disabled>
                      <Settings className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="flex items-center gap-2" disabled>
                      <User className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="flex h-14 items-start justify-end border-t px-4">
              <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">© 2024 Super GPT</p>
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