import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  signInWithCustomToken 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, googleProvider, db, app } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    // Détection et traitement du SSO Custom Token
    const searchParams = new URLSearchParams(window.location.search);
    const ssoToken = searchParams.get('ssoToken');
    let isSSOPending = Boolean(ssoToken);

    if (ssoToken) {
      // Nettoyage immédiat de l'URL pour ne pas laisser traîner le jeton dans l'historique
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('ssoToken');
      window.history.replaceState({}, document.title, cleanUrl.toString());

      let tokenUid = null;
      try {
        const parts = ssoToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          tokenUid = payload.uid || payload.sub || null;
        }
      } catch (_) {}

      if (auth.currentUser && tokenUid && auth.currentUser.uid === tokenUid) {
        isSSOPending = false;
      } else {
        setLoading(true);
        signInWithCustomToken(auth, ssoToken)
          .catch((err) => {
            console.warn("[Orchestrad'Or SSO] Erreur custom token :", err);
            setLoading(false);
          })
          .finally(() => {
            isSSOPending = false;
          });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Vérification si l'utilisateur existe dans Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            // -- NOUVEL UTILISATEUR : PROVISIONING VIA CLOUD FUNCTION --
            setIsProvisioning(true);
            try {
              const functions = getFunctions(app);
              const provisionNewMestre = httpsCallable(functions, 'provisionNewMestre');
              const result = await provisionNewMestre({});
              
              if (result.data && result.data.success) {
                console.log("Provisioning via Cloud Function réussi. GroupId:", result.data.groupId);
                setUserData({
                  uid: user.uid,
                  email: user.email,
                  role: 'mestre',
                  groupId: result.data.groupId
                });
                setIsAdmin(false);
              } else {
                console.error("Échec du provisioning via Cloud Function", result.data);
                setIsAdmin(false);
              }
            } catch (err) {
              console.error("Erreur lors de l'appel à la Cloud Function provisionNewMestre:", err);
              setIsAdmin(false);
            } finally {
              setIsProvisioning(false);
            }
          } else {
            // -- UTILISATEUR EXISTANT --
            const data = userDocSnap.data();
            setUserData(data);
            if (data.role === 'admin' || data.isAdmin || data.canWriteOrchestrador === true) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (e) {
          console.warn("Erreur lors du provisioning Firestore :", e);
          setIsAdmin(false);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
        if (!isSSOPending) {
          setLoading(false);
        }
      }
      if (user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userData,
    isAdmin,
    loading,
    isProvisioning,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
