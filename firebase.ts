import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY || '',
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_PROJECTID || '',
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID || '',
  appId: process.env.NEXT_PUBLIC_APPID || '',
};

// Suppress Firebase heartbeat logs
if (typeof window !== 'undefined') {
  const originalConsoleLog = console.log;
  console.log = (...args: any[]) => {
    if (args[0] !== 'heartbeats undefined') {
      originalConsoleLog.apply(console, args);
    }
  };
}

// Initialize Firebase only if config is valid (skip during build if env vars missing)
let app: FirebaseApp;

// Check if we have a valid API key (not empty string)
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0;

if (hasValidConfig && !getApps().length) {
  app = initializeApp(firebaseConfig);
} else if (getApps().length > 0) {
  app = getApps()[0];
} else {
  // Create a dummy app for build time - will be replaced at runtime
  app = {} as FirebaseApp;
}

export const auth: Auth = hasValidConfig ? getAuth(app) : {} as Auth;
export const db: Firestore = hasValidConfig ? getFirestore(app) : {} as Firestore;
export const storage: FirebaseStorage = hasValidConfig ? getStorage(app) : {} as FirebaseStorage;

export const initFirebase = (): FirebaseApp => {
  return app;
};

export default app;
