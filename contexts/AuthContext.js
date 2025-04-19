import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase_config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component to wrap around our app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state observer
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Clean up subscription
    return unsubscribe;
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Value to be provided to consumers
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
