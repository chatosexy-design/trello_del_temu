import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mongoUser, setMongoUser] = useState(null);

  const loginWithGoogle = async () => {
    try {
      console.log("[Auth] Abriendo ventana emergente de Google...");
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('[Auth] Error al iniciar sesión con Popup:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setMongoUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        console.log("[Auth] Firebase detectó al usuario:", firebaseUser.email);
        setUser(firebaseUser);
        const token = await firebaseUser.getIdToken();
        try {
          console.log("[Auth] Solicitando datos al Backend...");
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("[Auth] Datos del Backend recibidos:", response.data.name);
          setMongoUser(response.data);
        } catch (error) {
          console.error('[Auth] Error al pedir datos al Backend:', error.response?.status, error.message);
        }
      } else {
        console.log("[Auth] No hay usuario activo.");
        setUser(null);
        setMongoUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    mongoUser,
    loading,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
