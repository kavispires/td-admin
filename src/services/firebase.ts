import { message } from 'antd';
import { getAnalytics } from 'firebase/analytics';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import {
  type Auth,
  GoogleAuthProvider,
  type UserCredential,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';

const buildKey = () => {
  return [
    import.meta.env.VITE__FIREBASE_A,
    import.meta.env.VITE__FIREBASE_P,
    import.meta.env.VITE__FIREBASE_I,
  ].join('');
};

const firebaseConfig = {
  apiKey: buildKey(),
  authDomain: import.meta.env.VITE__FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE__FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE__FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE__FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE__FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE__FIREBASE_API_ID,
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

export const analytics = getAnalytics(firebaseApp);
export const auth: Auth = getAuth(firebaseApp);
export const firestore: Firestore = getFirestore(firebaseApp);

export default firebaseApp;

/**
 * Sign in user via email through firebase auth
 * @param email - the email of the user to sign in
 * @param password - the password of the user to sign in
 * @returns - the user credential
 */
export function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in user via google through firebase auth
 * @returns - the user credential
 */
export function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Sign out current user
 * @returns - a promise that resolves when the user is signed out
 */
export async function signOut(): Promise<void> {
  return auth.signOut().then(() => {
    message.warning(`You've been signed out`);
  });
}

export function printFirebase(message: string) {
  console.log(`%c📛 Firebase: ${message}`, 'color: #FFA500');
}
