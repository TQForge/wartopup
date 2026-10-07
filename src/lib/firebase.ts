import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocFromServer, 
  Timestamp, 
  orderBy, 
  increment,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Modern way to enable persistent cache (v10.3+)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, doc, getDoc, setDoc, addDoc, updateDoc, collection, query, where, onSnapshot, Timestamp, orderBy, increment, limit };
export type { User };
