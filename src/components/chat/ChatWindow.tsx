"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import useAuthStore from '@/store/useAuthStore';
import useChatStore from '@/store/useChatStore';
import { listenToMessages } from '@/lib/firebase/firestore';
import { Message } from '@/types';

interface ChatWindowProps {
  chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const user = useAuthStore(state => state.user);
  const { 
    messages, 
    hasMore, 
    loadMessages, 
    loadMoreMessages, 
    setMessages 
  } = useChatStore();
  
  // Load initial messages
  useEffect(() => {
    if (!chatId) return;
    
    const loadInitialMessages = async () => {
      setIsInitialLoading(true);
      try {
        await loadMessages(chatId, true);
      } catch (error) {
        console.error('Error loading initial messages:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadInitialMessages();
  }, [chatId, loadMessages]);
  
  // Set up real-time listener for new messages
  // useEffect(() => {
  //   if (!chatId) return;
    
  //   const unsubscribe = listenToMessages(chatId, (messages: Message[]) => {
  //     setMessages(messages);
  //   });
    
  //   return () => {
  //     unsubscribe();
  //   };
  // }, [chatId, setMessages]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (!isInitialLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isInitialLoading]);
  
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      // Store current scroll position and height
      const container = containerRef.current;
      const scrollHeight = container?.scrollHeight || 0;
      
      await loadMoreMessages();
      
      // After loading more messages, restore scroll position
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - scrollHeight;
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  if (isInitialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth"
    >
      {hasMore && (
        <div className="flex justify-center my-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more messages'
            )}
          </Button>
        </div>
      )}
      
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-xl font-semibold">No messages yet</h3>
            <p className="text-muted-foreground">
              Start the conversation by sending your first message below.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              chatId={chatId}
              isAI={message.senderId !== user?.uid}
            />
          ))}
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}