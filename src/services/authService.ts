import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const authService = {
  /**
   * Log in a user with email and password
   */
  login: async (email: string, password: string): Promise<FirebaseAuthTypes.User> => {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  /**
   * Register a new user with email, password and display name
   */
  signup: async (email: string, password: string, name: string): Promise<FirebaseAuthTypes.User> => {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name profile field in Firebase Auth
    await updateProfile(user, { displayName: name });

    // Persist user profile + default settings to Firestore (only Firestore, no local sqlite)
    try {
      const userDocRef = firestore().collection('users').doc(user.uid);

      const userData = {
        uid: user.uid,
        email: user.email ?? '',
        name: name,
        photoURL: user.photoURL ?? '',
        // default configuration values
        settings: {
          currency: 'USD',
          notifications: true,
          themeMode: 'light',
          cloudBackup: false,
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
      } as const;

      await userDocRef.set(userData);
    } catch (err) {
      // If Firestore write fails, log the error but don't block auth flow
      console.error('Failed to create user document in Firestore:', err);
    }

    return user;
  },

  /**
   * Log out the current user session
   */
  logout: async (): Promise<void> => {
    const auth = getAuth();
    await signOut(auth);
  },

  /**
   * Listen to Firebase auth state changes (login, logout, token refresh)
   */
  subscribeToAuthChanges: (callback: (user: FirebaseAuthTypes.User | null) => void): (() => void) => {
    const auth = getAuth();
    return onAuthStateChanged(auth, callback);
  },
};
