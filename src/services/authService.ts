import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

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
   * Sign in with Google using Firebase credential
   */
  signInWithGoogle: async (): Promise<FirebaseAuthTypes.User> => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      throw new Error('Google sign-in was cancelled');
    }
    const { idToken } = response.data;
    if (!idToken) throw new Error('No Google ID token received');
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(getAuth(), credential);
    return result.user;
  },

  /**
   * Update the display name of the currently authenticated user
   */
  updateDisplayName: async (name: string): Promise<void> => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    await updateProfile(user, { displayName: name });
  },

  /**
   * Listen to Firebase auth state changes (login, logout, token refresh)
   */
  subscribeToAuthChanges: (callback: (user: FirebaseAuthTypes.User | null) => void): (() => void) => {
    const auth = getAuth();
    return onAuthStateChanged(auth, callback);
  },
};
