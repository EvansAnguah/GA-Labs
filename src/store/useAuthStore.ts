import { create } from 'zustand';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfile {
  role: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  init: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ensure user document exists in 'users' collection
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let profileData = {};
        if (!userSnap.exists()) {
          // Create initial user document
          profileData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            createdAt: Date.now(),
            role: 'user'
          };
          await setDoc(userRef, profileData).catch(console.error);
        } else {
          profileData = userSnap.data();
        }
        set({ user: firebaseUser, profile: profileData as UserProfile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  }
}));
