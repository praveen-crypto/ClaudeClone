"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/useAuthStore";
import useChatStore from "@/store/useChatStore";

export default function ChatIndexPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { chats, loadChats, createNewChat, isLoading: chatsLoading } = useChatStore();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (user) {
      loadChats(user.uid);
    }
  }, [user, loadChats]);
  
  const handleCreateChat = async () => {
    if (!user) return;
    
    try {
      const chatId = await createNewChat(user.uid, "New Chat");
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If chats are still loading or there are chats, redirect to the most recent one
  useEffect(() => {
    if (!chatsLoading && chats.length > 0) {
      // Find most recent chat by updatedAt
      const sortedChats = [...chats].sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt.seconds * 1000);
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt.seconds * 1000);
        return dateB.getTime() - dateA.getTime();
      });
      
      router.push(`/chat/${sortedChats[0].id}`);
    }
  }, [chatsLoading, chats, router]);
  
  // If no chats exist, show a welcome screen
  if (!chatsLoading && chats.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Synduct Chat App</h1>
          <p className="text-muted-foreground">
            Create your first chat to get started 😊
          </p>
          <Button onClick={handleCreateChat} className="mt-4">
            Create a new chat
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}