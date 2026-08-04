import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAsJtagA5I8EOlgCf3nuaLIk9Jno6reg6w",
  authDomain: "studio-6375577680-96562.firebaseapp.com",
  projectId: "studio-6375577680-96562",
  storageBucket: "studio-6375577680-96562.firebasestorage.app",
  messagingSenderId: "843227074832",
  appId: "1:843227074832:web:bf64573a7a6257e0469595"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestore databaseId from configuration
export const db = getFirestore(app, "ai-studio-c80216de-1996-4418-a1a9-a045c366ee0e");
