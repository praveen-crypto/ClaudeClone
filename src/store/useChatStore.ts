import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  createChat, 
  getUserChats, 
  updateChatTitle, 
  deleteChat, 
  pinChat, 
  sendMessage, 
  getMessages, 
  deleteMessage, 
  addReaction 
} from '@/lib/firebase/firestore';
import { Chat, Message } from '@/types';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  lastMessageId: string | null;
  
  // Chat operations
  loadChats: (userId: string) => Promise<void>;
  createNewChat: (userId: string, title: string) => Promise<string>;
  updateTitle: (chatId: string, title: string) => Promise<void>;
  removeChat: (chatId: string) => Promise<void>;
  togglePinChat: (chatId: string, pinned: boolean) => Promise<void>;
  setCurrentChat: (chatId: string | null) => void;
  
  // Message operations
  loadMessages: (chatId: string, reset?: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendNewMessage: (chatId: string, userId: string, content: string, type?: string) => Promise<void>;
  removeMessage: (chatId: string, messageId: string) => Promise<void>;
  addMessageReaction: (chatId: string, messageId: string, userId: string, reaction: string) => Promise<void>;
  
  // Error handling
  clearError: () => void;
  
  // Set messages directly (used by listeners)
  setMessages: (messages: Message[]) => void;
  setChats: (chats: Chat[]) => void;
}

const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    chats: [],
    currentChatId: null,
    messages: [],
    isLoading: false,
    error: null,
    hasMore: true,
    lastMessageId: null,
    
    // Chat operations
    loadChats: async (userId) => {
      set({ isLoading: true, error: null });
      try {
        const userChats = await getUserChats(userId);
        set({ chats: userChats, isLoading: false });
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while loading chats', 
          isLoading: false 
        });
      }
    },
    
    createNewChat: async (userId, title) => {
      set({ isLoading: true, error: null });
      try {
        const chatId = await createChat(userId, title);
        const newChat: Chat = {
          id: chatId,
          title,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          participants: [userId],
          pinned: false
        };
        
        set(state => ({ 
          chats: [newChat, ...state.chats],
          currentChatId: chatId,
          isLoading: false 
        }));
        
        return chatId;
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while creating a new chat', 
          isLoading: false 
        });
        throw error;
      }
    },
    
    updateTitle: async (chatId, title) => {
      set({ isLoading: true, error: null });
      try {
        await updateChatTitle(chatId, title);
        
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, title, updatedAt: new Date() } 
              : chat
          ),
          isLoading: false
        }));
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while updating chat title', 
          isLoading: false 
        });
        throw error;
      }
    },
    
    removeChat: async (chatId) => {
      set({ isLoading: true, error: null });
      try {
        await deleteChat(chatId);
        
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
          isLoading: false
        }));
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while deleting chat', 
          isLoading: false 
        });
        throw error;
      }
    },
    
    togglePinChat: async (chatId, pinned) => {
      set({ isLoading: true, error: null });
      try {
        await pinChat(chatId, pinned);
        
        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, pinned, updatedAt: new Date() } 
              : chat
          ),
          isLoading: false
        }));
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while pinning/unpinning chat', 
          isLoading: false 
        });
        throw error;
      }
    },
    
    setCurrentChat: (chatId) => {
      set({ currentChatId: chatId, messages: [], hasMore: true, lastMessageId: null });
    },
    
    // Message operations
    loadMessages: async (chatId, reset = false) => {
      if (reset) {
        set({ messages: [], hasMore: true, lastMessageId: null });
      }
      
      set({ isLoading: true, error: null });
      try {
        const loadedMessages = await getMessages(chatId);
        
        set({ 
          messages: loadedMessages.reverse(),
          isLoading: false,
          hasMore: loadedMessages.length === 20,
          lastMessageId: loadedMessages.length > 0 ? loadedMessages[0].id : null
        });
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while loading messages', 
          isLoading: false 
        });
        throw error;
      }
    },
    
    loadMoreMessages: async () => {
      const { currentChatId, lastMessageId, hasMore } = get();
      
      if (!currentChatId || !lastMessageId || !hasMore) return;
      
      set({ isLoading: true, error: null });
      try {
        const loadedMessages = await getMessages(currentChatId, lastMessageId);
        
        set(state => ({ 
          messages: [...loadedMessages.reverse(), ...state.messages],
          isLoading: false,
          hasMore: loadedMessages.length === 20,
          lastMessageId: loadedMessages.length > 0 ? loadedMessages[0].id : state.lastMessageId
        }));
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while loading more messages', 
          isLoading: false 
        });
        throw error;
      }
    },
    
    sendNewMessage: async (chatId, userId, content, type = 'text') => {
      set({ error: null });
      try {
        const messageId = await sendMessage(chatId, userId, content, type);
        
        const newMessage: Message = {
          id: messageId,
          content,
          type,
          senderId: userId,
          createdAt: new Date(),
          reactions: {}
        };
        
        set(state => {
          // Update the chat's updatedAt timestamp
          const updatedChats = state.chats.map(chat => 
            chat.id === chatId 
              ? { ...chat, updatedAt: new Date() } 
              : chat
          );
          
          // Sort chats by updatedAt (newest first)
          updatedChats.sort((a, b) => 
            b.updatedAt.getTime() - a.updatedAt.getTime()
          );
          
          return {
            messages: [...state.messages, newMessage],
            chats: updatedChats
          };
        });
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while sending message'
        });
        throw error;
      }
    },
    
    removeMessage: async (chatId, messageId) => {
      set({ error: null });
      try {
        await deleteMessage(chatId, messageId);
        
        set(state => ({
          messages: state.messages.filter(message => message.id !== messageId)
        }));
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while deleting message'
        });
        throw error;
      }
    },
    
    addMessageReaction: async (chatId, messageId, userId, reaction) => {
      set({ error: null });
      try {
        await addReaction(chatId, messageId, userId, reaction);
      } catch (error: any) {
        set({ 
          error: error.message || 'An error occurred while adding reaction'
        });
        throw error;
      }
    },
    
    // Error handling
    clearError: () => {
      set({ error: null });
    },
    
    // Set messages/chats directly (used by listeners)
    setMessages: (messages) => {
      set({ messages });
    },
    
    setChats: (chats) => {
      set({ chats });
    }
  }))
);

export default useChatStore;