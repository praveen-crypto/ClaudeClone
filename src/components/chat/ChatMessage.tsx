"use client";

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { MoreHorizontal, Bookmark, ThumbsUp, Heart, Loader2, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/useAuthStore';
import useChatStore from '@/store/useChatStore';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  chatId: string;
  isAI?: boolean;
  isLoading?: boolean;
  isThinking?: boolean;
}

export default function ChatMessage({ 
  message, 
  chatId, 
  isAI = false,
  isLoading = false,
  isThinking = false 
}: ChatMessageProps) {
  const [isAddingReaction, setIsAddingReaction] = useState(false);
  const user = useAuthStore(state => state.user);
  const { addMessageReaction, removeMessage } = useChatStore();
  
  const handleReaction = async (reaction: string) => {
    if (!user || isAddingReaction) return;
    
    setIsAddingReaction(true);
    try {
      await addMessageReaction(chatId, message.id, user.uid, reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsAddingReaction(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      await removeMessage(chatId, message.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  const hasUserReacted = (reaction: string) => {
    return user && message.reactions && message.reactions[user.uid] === reaction;
  };
  
  const reactionCount = (reaction: string) => {
    if (!message.reactions) return 0;
    return Object.values(message.reactions).filter(r => r === reaction).length;
  };
  
  const createdAt = message.createdAt instanceof Date 
    ? message.createdAt 
    : new Date(message.createdAt.seconds * 1000);
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const renderMessageContent = () => {
    if (isThinking) {
      return (
        <div className="flex flex-col gap-2">
          <div className="text-sm flex items-center gap-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping absolute" />
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <span className="text-muted-foreground">Thinking...</span>
          </div>
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-3 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading message...</span>
        </div>
      );
    }
    
    return (
      <div className="prose dark:prose-invert max-w-none break-words">
        <ReactMarkdown
          
          
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md !my-4"
                  showLineNumbers
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={cn("px-1.5 py-0.5 rounded-md bg-muted", className)} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };
  
  const messageClasses = cn(
    "relative p-4 rounded-lg max-w-[85%] message-container group",
    isAI 
      ? "bg-card border border-border ml-0 mr-auto" 
      : "bg-primary text-primary-foreground ml-auto mr-0"
  );
  
  return (
    <div className={cn("flex gap-4 py-4", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="AI" />
            <AvatarFallback className="bg-slate-600 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={messageClasses}>
        {renderMessageContent()}
        
        {/* Time and actions */}
        <div className={cn(
          "flex items-center gap-1 absolute -bottom-5 text-xs",
          isAI ? "left-0" : "right-0"
        )}>
          <span className="text-muted-foreground">
            {format(createdAt, 'h:mm a')}
          </span>
          
          {/* Reaction buttons - only show on hover */}
          {!isThinking && !isLoading && (
            <div className={cn(
              "flex items-center gap-1 absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity",
              isAI ? "left-0 -translate-y-full" : "right-0 -translate-y-full" 
            )}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleReaction('like')}
                      disabled={isAddingReaction}
                    >
                      <ThumbsUp className={cn(
                        "h-3 w-3",
                        hasUserReacted('like') && "fill-current text-blue-500"
                      )} />
                      {reactionCount('like') > 0 && (
                        <span className="absolute -top-1 -right-1 text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {reactionCount('like')}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Like</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleReaction('love')}
                      disabled={isAddingReaction}
                    >
                      <Heart className={cn(
                        "h-3 w-3",
                        hasUserReacted('love') && "fill-current text-red-500"
                      )} />
                      {reactionCount('love') > 0 && (
                        <span className="absolute -top-1 -right-1 text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                          {reactionCount('love')}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Love</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleReaction('save')}
                      disabled={isAddingReaction}
                    >
                      <Bookmark className={cn(
                        "h-3 w-3",
                        hasUserReacted('save') && "fill-current text-purple-500"
                      )} />
                      {reactionCount('save') > 0 && (
                        <span className="absolute -top-1 -right-1 text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          {reactionCount('save')}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isAI ? "start" : "end"}>
                  <DropdownMenuItem onClick={handleDelete}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      
      {!isAI && (
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.photoURL || ''} 
              alt={user?.displayName || 'User'} 
            />
            <AvatarFallback>
              {user?.displayName ? getInitials(user.displayName) : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}