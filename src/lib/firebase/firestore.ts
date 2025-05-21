import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  Timestamp, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { User } from 'firebase/auth';
import { Chat, Message, UserProfile, ActivityLogEntry  } from '@/types';

// User Profile
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const defaultPreferences = {
      theme: 'system',
      fontSize: 'medium',
      notifications: {
        newMessages: true,
        mentions: true,
        systemUpdates: true,
        email: true,
      },
      privacy: {
        showOnlineStatus: true,
        showReadReceipts: true,
        allowDirectMessages: true,
      },
      language: 'en',
      keyboardShortcuts: {},
    };
    
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      ...data,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      preferences: defaultPreferences,
      stats: {
        totalMessages: 0,
        totalChats: 0,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      },
      subscriptionTier: 'free',
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      const updatedPreferences = {
        ...userData.preferences,
        ...preferences,
      };
      
      await updateDoc(doc(db, 'users', userId), {
        preferences: updatedPreferences,
      });
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const logUserActivity = async (userId: string, action: string, details?: any): Promise<void> => {
  try {
    const activityRef = collection(db, 'users', userId, 'activityLog');
    await addDoc(activityRef, {
      action,
      timestamp: serverTimestamp(),
      details,
    });
    
    // Update last active timestamp
    await updateDoc(doc(db, 'users', userId), {
      'stats.lastActive': new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw error;
  }
};

export const getUserActivityLog = async (userId: string, limit = 50): Promise<ActivityLogEntry[]> => {
  try {
    const activityQuery = query(
      collection(db, 'users', userId, 'activityLog'),
      orderBy('timestamp', 'desc')
      // limit(limit)
    );
    
    const activitySnapshot = await getDocs(activityQuery);
    
    return activitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ActivityLogEntry[];
  } catch (error) {
    console.error('Error getting user activity log:', error);
    throw error;
  }
};

export const exportUserData = async (userId: string): Promise<UserProfile & { activityLog: ActivityLogEntry[] }> => {
  try {
    const userProfile = await getUserProfile(userId);
    const activityLog = await getUserActivityLog(userId, 1000);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    return {
      ...userProfile,
      activityLog,
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    // Delete activity log subcollection
    const activityQuery = query(collection(db, 'users', userId, 'activityLog'));
    const activitySnapshot = await getDocs(activityQuery);
    
    const deletePromises = activitySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    // Delete user document
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};


// Chats
export const createChat = async (userId: string, title: string): Promise<string> => {
  try {
    const chatRef = await addDoc(collection(db, 'chats'), {
      title,
      createdBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      participants: [userId],
      pinned: false
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    
    return chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

export const listenToUserChats = (userId: string, callback: (chats: Chat[]) => void) => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(chatsQuery, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      
      callback(chats);
    });
  } catch (error) {
    console.error('Error listening to user chats:', error);
    throw error;
  }
};

export const updateChatTitle = async (chatId: string, title: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      title,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    // Delete all messages in the chat
    const messagesQuery = query(collection(db, 'chats', chatId, 'messages'));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const deletePromises = messagesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    
    // Delete the chat document
    await deleteDoc(doc(db, 'chats', chatId));
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

export const pinChat = async (chatId: string, pinned: boolean) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      pinned,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error pinning/unpinning chat:', error);
    throw error;
  }
};

// Messages
export const sendMessage = async (chatId: string, userId: string, content: string, type = 'text') => {
  try {
    const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
      content,
      type,
      senderId: userId,
      createdAt: Timestamp.now(),
      reactions: {}
    });
    
    // Update the chat's updatedAt timestamp
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      updatedAt: Timestamp.now()
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId: string, lastMessageId?: string, pageSize = 20): Promise<Message[]> => {
  try {
    let messagesQuery;
    
    if (lastMessageId) {
      const lastMessageDoc = await getDoc(doc(db, 'chats', chatId, 'messages', lastMessageId));
      messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'desc'),
        startAfter(lastMessageDoc),
        limit(pageSize)
      );
    } else {
      messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    return messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const listenToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  try {
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      callback(messages);
    });
  } catch (error) {
    console.error('Error listening to messages:', error);
    throw error;
  }
};

export const updateMessage = async (chatId: string, messageId: string, content: string) => {
  try {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      content,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const deleteMessage = async (chatId: string, messageId: string) => {
  try {
    await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};