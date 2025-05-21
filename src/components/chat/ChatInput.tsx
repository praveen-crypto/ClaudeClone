"use client";

import { useRef, useState, useEffect } from 'react';
import { SendHorizontal, Paperclip, Mic, Loader2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/useAuthStore';
import useChatStore from '@/store/useChatStore';
import { useToast } from '@/hooks/use-toast';
import openai from '@/lib/openai';

interface ChatInputProps {
  chatId: string;
}

export default function ChatInput({ chatId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const user = useAuthStore(state => state.user);
  const { sendNewMessage } = useChatStore();
  
  // Handle voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        variant: 'destructive',
        title: 'Not supported',
        description: 'Voice input is not supported in your browser',
      });
      return;
    }
    
    // @ts-ignore - WebkitSpeechRecognition is not in the type definitions
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    setIsRecording(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev + transcript);
      setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      
      toast({
        variant: 'destructive',
        title: 'Voice input error',
        description: event.error,
      });
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only handle text files for now
    if (!file.type.startsWith('text/')) {
      toast({
        variant: 'destructive',
        title: 'Unsupported file type',
        description: 'Only text files are supported at the moment',
      });
      return;
    }
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMessage(prev => prev + '```\n' + content + '\n```');
      }
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File read error',
        description: 'Failed to read the file',
      });
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Handle message submission
  const handleSubmit = async () => {
    if (!message.trim() || !user) return;
    
    setIsSending(true);
    
    try {
      await sendNewMessage(chatId, user.uid, message.trim()).then(async () => {
        // setMessage('');
        // textareaRef.current?.focus();
        
        // const body = {
        //   model: "qwen/qwq-32b:free",
        //   messages: [
        //     {
        //       "role": "user",
        //       "content": message.trim()
        //     }
        //   ]
        // }

        await openai.post("", {
          model: "qwen/qwq-32b:free",
          messages: [
            {
              role: "user",
              content: message.trim(),
            },
          ],
        }).then( async (res) => {
          await sendNewMessage(chatId, "", res.data.choices[0].message.content);

          // console.log("AI Response: ", res);
        } );
        
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: error.message,
      });
    } finally {
      setIsSending(false);
      setMessage('');
      textareaRef.current?.focus();
    }
  };
  
  // Handle keyboard shortcuts (Ctrl+Enter or Cmd+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Auto-focus textarea on component mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  
  const isDisabled = !message.trim() || isSending || !user;
  
  return (
    <div className="w-full p-4 bg-background border-t border-border flex flex-col">
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-start">
          <TextareaAutosize
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              "flex-1 resize-none bg-transparent py-3 px-4 outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            minRows={1}
            maxRows={6}
            disabled={isSending || isRecording || isUploading}
          />
          
          <div className="flex items-center p-2 gap-1">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isSending || isRecording || isUploading}
            />
            <label htmlFor="file-upload">
              <Button 
                size="icon" 
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                disabled={isSending || isRecording || isUploading}
                asChild
              >
                <span>
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Paperclip className="h-5 w-5" />
                  )}
                </span>
              </Button>
            </label>
            
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                isRecording && "text-red-500 hover:text-red-600"
              )}
              onClick={handleVoiceInput}
              disabled={isSending || isUploading}
            >
              {isRecording ? (
                <span className="relative">
                  <Mic className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                </span>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              size="icon"
              className={cn("transition-all", isDisabled && "opacity-50")}
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-1 text-xs text-muted-foreground text-center">
        Press <kbd className="px-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-1 bg-muted rounded text-xs">Enter</kbd> to send
      </div>
    </div>
  );
}