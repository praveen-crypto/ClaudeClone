"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  FolderPlus, 
  AlignJustify,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/useAuthStore';
import useChatStore from '@/store/useChatStore';
import ChatList from './ChatList';

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export default function Sidebar({ className, isMobile = false }: SidebarProps) {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { 
    chats, 
    createNewChat, 
    currentChatId,
    setCurrentChat,
  } = useChatStore();
  
  const handleCreateChat = async () => {
    if (isCreatingChat || !user) return;
    
    setIsCreatingChat(true);
    try {
      const chatId = await createNewChat(user.uid, 'New Chat');
      router.push(`/chat/${chatId}`);
      if (isMobile) {
        setIsMobileOpen(false);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Filter chats based on search query
  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;
  
  // Separate pinned and unpinned chats
  const pinnedChats = filteredChats.filter(chat => chat.pinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.pinned);
  
  const sidebarContent = (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold tracking-tight">Chats</h2>
        <div className="flex items-center gap-1">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="px-4">
        <Button 
          className="w-full justify-start gap-2" 
          onClick={handleCreateChat}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PlusCircle className="h-5 w-5" />
          )}
          New Chat
        </Button>
      </div>
      
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search chats..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Separator className="my-1" />
      
      <ScrollArea className="flex-1 px-2">
        {pinnedChats.length > 0 && (
          <div className="mb-4">
            <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">
              Pinned
            </h3>
            <ChatList 
              chats={pinnedChats} 
              currentChatId={currentChatId} 
              onSelectChat={(chatId) => {
                setCurrentChat(chatId);
                router.push(`/chat/${chatId}`);
                if (isMobile) {
                  setIsMobileOpen(false);
                }
              }}
            />
          </div>
        )}
        
        {unpinnedChats.length > 0 && (
          <div>
            {pinnedChats.length > 0 && (
              <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">
                All Chats
              </h3>
            )}
            <ChatList 
              chats={unpinnedChats} 
              currentChatId={currentChatId}
              onSelectChat={(chatId) => {
                setCurrentChat(chatId);
                router.push(`/chat/${chatId}`);
                if (isMobile) {
                  setIsMobileOpen(false);
                }
              }}
            />
          </div>
        )}
        
        {filteredChats.length === 0 && (
          <div className="px-4 py-8 text-center">
            {searchQuery ? (
              <p className="text-muted-foreground">No chats found</p>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">No chats yet</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateChat}
                  disabled={isCreatingChat}
                >
                  {isCreatingChat ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Start a chat
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <Separator className="my-1" />
      
      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <div className={className}>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
            >
              <AlignJustify className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  return (
    <div className={cn("border-r border-border h-full", className)}>
      {sidebarContent}
    </div>
  );
}