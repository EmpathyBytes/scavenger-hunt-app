import React, { createContext, useContext, useEffect } from 'react';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase_config'
import { useAuth } from './AuthContext';

const SessionGuardContext = createContext();

// Must use client listener to monitor session changes, then move user to JoinSessionScreen if needed
export const SessionGuardProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  // Optional: Check current route name to avoid redirecting if already at JoinSessionScreen
  const currentRouteName = useNavigationState(state => 
    state ? state.routes[state.index].name : 'Unknown'
  );

  useEffect(() => {
    if (!currentUser) return;

    // Watch the 'currentSession' field that UserService modifies
    const userSessionRef = ref(database, `users/${currentUser.uid}/currentSession`);

    const unsubscribe = onValue(userSessionRef, (snapshot) => {
      const activeSessionId = snapshot.val();

      // IF: User has NO active session
      // AND: User is NOT on a "safe" screen (like Home, Profile, etc.)
      // THEN: Kick them to JoinSessionScreen
      if (!activeSessionId) {
        // Define safe screens where user can stay without active session
        const safeScreens = ['WelcomeScreen', 'LogInScreen', 'SignUpScreen', 'JoinSessionScreen'];
        
        if (!safeScreens.includes(currentRouteName)) {
            console.log("User kicked or session ended. Redirecting to JoinSessionScreen.");
            
            // Reset prevents users from scrolling back
            navigation.reset({
              index: 0,
              routes: [{ name: 'JoinSessionScreen' }],
            });
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigation, currentRouteName]);

  return (
    <SessionGuardContext.Provider value={{}}>
      {children}
    </SessionGuardContext.Provider>
  );
};