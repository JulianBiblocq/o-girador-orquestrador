import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
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
            if (data.role === 'admin' || data.isAdmin) {
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
      }
      setLoading(false);
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
