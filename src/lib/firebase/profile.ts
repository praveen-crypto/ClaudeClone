import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import { updateProfile } from "firebase/auth";
import { updateUserProfile } from "./firestore";

import { auth, app } from './config';

const storage = getStorage(app);

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `profilePictures/${userId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    }
    
    // Update in Firestore
    await updateUserProfile(userId, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

export const deleteProfilePicture = async (userId: string): Promise<void> => {
  try {
    const storageRef = ref(storage, `profilePictures/${userId}`);
    await deleteObject(storageRef);
    
    // Update auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: "" });
    }
    
    // Update in Firestore
    await updateUserProfile(userId, { photoURL: "" });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};
