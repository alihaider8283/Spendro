import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';

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
