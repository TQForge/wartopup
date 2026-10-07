import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot, User } from '../lib/firebase';
import { getAvatarDataUrl } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the auth provider, but we log it
}

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  balance: number;
  supportPin: string;
  weeklySpent: number;
  totalSpent: number;
  totalOrder: number;
  isVerified: boolean;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function areProfilesEqual(p1: UserProfile | null, p2: UserProfile | null): boolean {
  if (p1 === p2) return true;
  if (!p1 || !p2) return false;
  return (
    p1.uid === p2.uid &&
    p1.displayName === p2.displayName &&
    p1.email === p2.email &&
    p1.photoURL === p2.photoURL &&
    p1.balance === p2.balance &&
    p1.supportPin === p2.supportPin &&
    p1.weeklySpent === p2.weeklySpent &&
    p1.totalSpent === p2.totalSpent &&
    p1.totalOrder === p2.totalOrder &&
    p1.isVerified === p2.isVerified &&
    p1.phone === p2.phone &&
    p1.role === p2.role
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('cached_user');
    return cached ? JSON.parse(cached) as any as User : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('cached_profile');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(() => {
    const cachedUser = localStorage.getItem('cached_user');
    const cachedProfile = localStorage.getItem('cached_profile');
    return !(cachedUser && cachedProfile);
  });
  const [isAuthReady, setIsAuthReady] = useState(() => {
    const cachedUser = localStorage.getItem('cached_user');
    return cachedUser !== null;
  });

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        let resolvedPhotoURL = data.photoURL;
        if (auth.currentUser.photoURL && auth.currentUser.photoURL.startsWith('http')) {
          if (!resolvedPhotoURL || resolvedPhotoURL.startsWith('data:')) {
            resolvedPhotoURL = auth.currentUser.photoURL;
            setDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: auth.currentUser.photoURL }, { merge: true })
              .catch(err => console.error("Error updating Google profile photo during refresh:", err));
          }
        }
        if (!resolvedPhotoURL) {
          resolvedPhotoURL = getAvatarDataUrl(data.displayName || data.email || auth.currentUser.displayName || auth.currentUser.email);
        }

        const profileData: UserProfile = {
          uid: data.uid || auth.currentUser.uid,
          displayName: data.displayName || auth.currentUser.displayName,
          email: data.email || auth.currentUser.email,
          photoURL: resolvedPhotoURL,
          balance: data.balance || 0,
          supportPin: data.supportPin || '',
          weeklySpent: data.weeklySpent || 0,
          totalSpent: data.totalSpent || 0,
          totalOrder: data.totalOrder || 0,
          isVerified: data.isVerified || false,
          phone: data.phone || '',
          role: data.role || 'user'
        };
        setProfile(prev => {
          if (areProfilesEqual(prev, profileData)) {
            return prev;
          }
          localStorage.setItem('cached_profile', JSON.stringify(profileData));
          return profileData;
        });
      }
    } catch (err) {
      console.error("Failed to refresh profile manually:", err);
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      let unsubProfile: (() => void) | null = null;

      if (currentUser) {
        // Cache user fields for silent, instant session restoration on future reloads
        const simplifiedUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        };
        localStorage.setItem('cached_user', JSON.stringify(simplifiedUser));

        // If we have cached profile, resolve states immediately to bypass blank loads/redirects
        const cached = localStorage.getItem('cached_profile');
        if (cached) {
          setLoading(false);
          setIsAuthReady(true);
        }

        // Use onSnapshot for the profile to get instant cache + real-time updates
        unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc: any) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            let resolvedPhotoURL = data.photoURL;
            if (currentUser.photoURL && currentUser.photoURL.startsWith('http')) {
              if (!resolvedPhotoURL || resolvedPhotoURL.startsWith('data:')) {
                resolvedPhotoURL = currentUser.photoURL;
                setDoc(doc(db, 'users', currentUser.uid), { photoURL: currentUser.photoURL }, { merge: true })
                  .catch(err => console.error("Error updating Google profile photo in Firestore:", err));
              }
            }
            if (!resolvedPhotoURL) {
              resolvedPhotoURL = getAvatarDataUrl(data.displayName || data.email || currentUser.displayName || currentUser.email);
            }

            const profileData: UserProfile = {
              uid: data.uid || currentUser.uid,
              displayName: data.displayName || currentUser.displayName,
              email: data.email || currentUser.email,
              photoURL: resolvedPhotoURL,
              balance: data.balance || 0,
              supportPin: data.supportPin || '',
              weeklySpent: data.weeklySpent || 0,
              totalSpent: data.totalSpent || 0,
              totalOrder: data.totalOrder || 0,
              isVerified: data.isVerified || false,
              phone: data.phone || '',
              role: data.role || 'user'
            };
            setProfile(prev => {
              if (areProfilesEqual(prev, profileData)) {
                return prev;
              }
              localStorage.setItem('cached_profile', JSON.stringify(profileData));
              return profileData;
            });
          } else if (!userDoc.metadata.fromCache) {
            // Only create initial profile if we're sure it doesn't exist on server
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL || getAvatarDataUrl(currentUser.displayName || currentUser.email),
              balance: 0,
              supportPin: Math.floor(1000000 + Math.random() * 9000000).toString(),
              weeklySpent: 0,
              totalSpent: 0,
              totalOrder: 0,
              isVerified: false,
              phone: '',
              role: 'user'
            };
            setDoc(doc(db, 'users', currentUser.uid), initialProfile).catch(err => {
              console.error("Failed to create profile:", err);
            });
          }
          
          // Set ready states
          setLoading(false);
          setIsAuthReady(true);
        }, (err: any) => {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          setLoading(false);
          setIsAuthReady(true);
        });
      } else {
        setProfile(null);
        localStorage.removeItem('cached_user');
        localStorage.removeItem('cached_profile');
        setLoading(false);
        setIsAuthReady(true);
      }

      return () => {
        if (unsubProfile) unsubProfile();
      };
    });

    return () => unsubAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
