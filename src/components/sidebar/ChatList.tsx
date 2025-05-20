"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Pencil, 
  Trash2, 
  Pin, 
  MoreHorizontal,
  Check,
  X,
  PinOff,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import useChatStore from '@/store/useChatStore';
import { Chat } from '@/types';

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, currentChatId, onSelectChat }: ChatListProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPinning, setIsPinning] = useState<string | null>(null);
  
  const { updateTitle, removeChat, togglePinChat } = useChatStore();
  
  const handleEdit = (chat: Chat) => {
    setEditingChatId(chat.id);
    setNewTitle(chat.title);
  };
  
  const handleCancelEdit = () => {
    setEditingChatId(null);
    setNewTitle('');
  };
  
  const handleSaveEdit = async (chatId: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateTitle(chatId, newTitle.trim());
      setEditingChatId(null);
      setNewTitle('');
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };
  
  const handleDelete = async (chatId: string) => {
    setIsDeleting(chatId);
    try {
      await removeChat(chatId);
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setIsDeleting(null);
    }
  };
  
  const handleTogglePin = async (chatId: string, isPinned: boolean) => {
    setIsPinning(chatId);
    try {
      await togglePinChat(chatId, !isPinned);
    } catch (error) {
      console.error('Error toggling pin status:', error);
    } finally {
      setIsPinning(null);
    }
  };
  
  const formatDate = (date: Date | any) => {
    const chatDate = date instanceof Date ? date : new Date(date.seconds * 1000);
    const now = new Date();
    
    // If today, show time
    if (chatDate.toDateString() === now.toDateString()) {
      return format(chatDate, 'h:mm a');
    }
    
    // If this year, show month and day
    if (chatDate.getFullYear() === now.getFullYear()) {
      return format(chatDate, 'MMM d');
    }
    
    // Otherwise, show month, day, year
    return format(chatDate, 'MMM d, yyyy');
  };
  
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className={cn(
            "p-3 cursor-pointer transition-colors hover:bg-accent",
            chat.id === currentChatId && "bg-accent",
            editingChatId === chat.id && "ring-1 ring-ring"
          )}
          onClick={() => {
            if (editingChatId !== chat.id) {
              onSelectChat(chat.id);
            }
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-8"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit(chat.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {chat.pinned && (
                    <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <h3 className="font-medium truncate">{chat.title}</h3>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(chat.updatedAt)}
              </p>
            </div>
            
            {editingChatId !== chat.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(chat);
                  }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePin(chat.id, chat.pinned);
                  }}>
                    {isPinning === chat.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      chat.pinned ? (
                        <PinOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Pin className="mr-2 h-4 w-4" />
                      )
                    )}
                    {chat.pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(chat.id);
                    }}
                  >
                    {isDeleting === chat.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}