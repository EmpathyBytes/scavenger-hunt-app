import React, { useState, useRef, useEffect } from 'react';
import { Image, Text, View, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SIZES } from '../components/theme'; 
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'; 
import BasicButton from '../components/BasicButton';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { useServices } from '../contexts/ServiceContext';

const JoinSessionScreen = ({ navigation }) => {
  // Use the auth context to access the authenticated user's UID
  const { user, isAuthenticated } = useAuth();
  
  // Use the services context to access the UserService and SessionService
  const { userService, sessionService } = useServices();
  
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });
  
  const [sessionCode, setSessionCode] = useState('');
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [joiningSession, setJoiningSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check authentication status and fetch user data
  useEffect(() => {
    // First check if user is authenticated
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' }],
      });
      return;
    }

    // Then fetch the user data from the database using the UID
    const fetchUserData = async () => {
      try {
        if (user && user.uid) {
          const userDataFromDB = await userService.getUser(user.uid);
          setUserData(userDataFromDB);
          
          // If user already has a current session, redirect to home screen
          if (userDataFromDB && userDataFromDB.currentSession) {
            console.log("User already in session, forwarding to home screen");
            navigation.replace('HomeScreen');
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user, navigation, userService]);

  const handleFocus = () => {
    setErrorMessage('');
  };
  
  // Note: When this is pressed, we need to fetch updated user data
  const handleJoinSession = async () => {
    // Reset error message
    setErrorMessage('');
    
    if (!sessionCode.trim()) {
      setErrorMessage("Please enter a session code");
      return;
    }
    
    /*
    // Forward to home screen if user enters their current session code
    if (userData && userData.currentSession === sessionCode) {
      navigation.replace('HomeScreen');
      return;
    }
    
    
    // Check if user is already in a different active session
    if (userData && userData.currentSession) {
      setErrorMessage("You're already in an active session. Please leave your current session before joining a new one.");
      return;
    }
    */
    
    setJoiningSession(true);
    
    try {
      // Always get fresh user data at the start
      // Since setUserData() is async, updating the state will not update value for next lines
      // Need to create freshUserData and then update
      let freshUserData = await userService.getUser(user.uid);
      if (!freshUserData) throw new Error("User not found");

      // Check if already in this session
      if (freshUserData.currentSession === sessionCode) {
        console.log("Already in current session:", sessionCode);
        navigation.replace('HomeScreen');
        return;
      }

      // Check if user is already in a different session
      if (freshUserData.currentSession) {
        setErrorMessage("You're already in an active session. Please leave your current session before joining a new one.");
        return;
      }

      // Check if the session exists
      const sessionExists = await sessionService.getSession(sessionCode);
      
      if (!sessionExists) {
        setErrorMessage("Session not found. Please check the code and try again.");
        setJoiningSession(false);
        return;
      }
      
      // Check if the session is active
      if (!sessionService.sessionIsActive(sessionExists)) {
        setErrorMessage("This session is not currently active.");
        setJoiningSession(false);
        return;
      }
      
      // First check if user is already part of this session
      if (freshUserData.sessionsJoined && freshUserData.sessionsJoined[sessionCode]) {
        // User is already part of this session, just set it as current and proceed
        await userService.setCurrentSession(user.uid, sessionCode);
        
        // Wait a moment for the database to update and refresh user data
        const updatedUserData = await userService.getUser(user.uid);
        setUserData(updatedUserData);

        navigation.replace('HomeScreen');
        return;
      }
      
      // Add user to the session (only if not already joined)
      await userService.addUserToSession(user.uid, sessionCode);
      
      // Set as current session
      await userService.setCurrentSession(user.uid, sessionCode);
      
      // Update local user data
      const updatedUserData = await userService.getUser(user.uid);
      setUserData(updatedUserData);
      
      // Show success message
      Alert.alert(
        "Success!",
        `You've joined the session: ${sessionExists.sessionName}`,
        [{ text: "Let's go!", onPress: () => navigation.replace('HomeScreen') }]
      );
      
    } catch (error) {
      console.error("Error joining session:", error);
      setErrorMessage(error.message || "Failed to join session. Please try again.");
    } finally {
      setJoiningSession(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.beige }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.beige }}>
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.goBack()} />
      </View>
      <Image
        style={styles.bee}
        source={require('../assets/bee.png')}/>
      <Text style={styles.title}>Join Game</Text>
      {userData && userData.email && 
        <Text style={styles.welcomeText}>Hi, {userData.email}</Text>
      }
      <View style={styles.inputcontainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, errorMessage ? styles.inputError : null]}
          value={sessionCode}
          onChangeText={setSessionCode}
          onFocus={handleFocus}
          placeholder="Enter Super Secret Game Code"
          maxLength={20}
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
      <BasicButton
        text={joiningSession ? "Joining..." : "Join Game"}
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        disabled={joiningSession}
        onPress={handleJoinSession}/>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.title,
    color: COLORS.navy
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.navy,
    padding: 10,
    borderRadius: 15,
    width: 310,
    height: 50,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  inputError: {
    borderColor: 'red',
  },
  inputcontainer: {
    padding: 17,
    paddingTop: 70,
    width: '100%',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  bee: {
    height: 140,
    marginBottom: 60,
    objectFit: 'contain',
    alignSelf: 'center',
  },
  welcomeText: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    marginTop: 5,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default JoinSessionScreen;