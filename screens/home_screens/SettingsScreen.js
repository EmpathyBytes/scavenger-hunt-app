import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../components/theme'; //colors and sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BasicButton from '../../components/BasicButton';
import { useAuth } from '../../contexts/AuthContext';
import { useServices } from '../../contexts/ServiceContext';
import { getPlayerPoints } from '../../services/PointService';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase_config";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth(); // Get signOut from AuthContext
  const { userService, sessionService } = useServices();
  
  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leavingSession, setLeavingSession] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [points, setPoints] = useState(0);
  
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });
  
  // Fetch user and session data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const userData = await userService.getUser(user.uid);
        setUserData(userData);
        
        if (userData?.currentSession) {
          const sessionData = await sessionService.getSession(userData.currentSession);
          setSessionData(sessionData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, userService, sessionService]);

useEffect(() => { //dynamically updates points
  if (!userData?.currentSession || !user?.uid) return;

  const pointsRef = ref(database, `development_node/users/${user.uid}/sessionsJoined/${userData.currentSession}/points`);

  const unsubscribe = onValue(pointsRef, (snapshot) => { //live listener for points
    const val = snapshot.val();
    setPoints(val || 0);
  });

  return () => unsubscribe();
}, [userData, user]);
  
  const handleLeaveSession = async () => {
    if (!userData?.currentSession) {
      Alert.alert("Error", "You are not currently in a session");
      return;
    }
    
    // Ask for confirmation
    Alert.alert(
      "Leave Session",
      "Are you sure you want to leave the current session?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: performLeaveSession
        }
      ]
    );
  };
  
  const performLeaveSession = async () => {
    try {
      setLeavingSession(true);
      const sessionId = userData.currentSession;
      
      // Check if user is in a team
      const sessionInfo = userData.sessionsJoined[sessionId];
      if (sessionInfo?.teamId) {
        // Remove from team first
        await userService.removeUserFromTeam(user.uid, sessionId);
      }
      
      // Remove from session
      await userService.removeUserFromSession(user.uid, sessionId);
      
      // Success notification
      Alert.alert(
        "Success",
        "You have left the session successfully.",
        [{ text: "OK", onPress: () => navigation.replace("JoinSessionScreen") }]
      );
      
    } catch (error) {
      console.error("Error leaving session:", error);
      Alert.alert("Error", error.message || "Failed to leave session. Please try again.");
    } finally {
      setLeavingSession(false);
    }
  };

  const handleEditDisplayName = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert("Error", "Display name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await userService.setDisplayName(user.uid, newDisplayName);
      const updatedUserData = await userService.getUser(user.uid);
      setUserData(updatedUserData);
      setEditingDisplayName(false);
      Alert.alert("Success", "Display name updated successfully.");
    } catch (error) {
      console.error("Error updating display name:", error);
      Alert.alert("Error", "Failed to update display name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              // Navigate back to welcome screen after successful logout
              navigation.reset({
                index: 0,
                routes: [{ name: 'WelcomeScreen' }],
              });
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, width: '100%' }}>
        <View style={styles.usernameContainer}>
          {editingDisplayName ? (
            <TextInput
              style={styles.input}
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              placeholder="Enter new display name"
              maxLength={30}
            />
          ) : (
            <Text style={styles.usernameText}>{userData?.displayName || "Username"}</Text>
          )}
          <View style={styles.editContainer}>
            <TouchableOpacity onPress={() => {
              if (!editingDisplayName) {
                setNewDisplayName(userData?.displayName || '');
                setEditingDisplayName(true);
              }
            }}>
              <Image style={styles.editImage} source={require('../../assets/Edit.png')} />
            </TouchableOpacity>
            {editingDisplayName && (
              <TouchableOpacity onPress={handleEditDisplayName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.circle}>
          <Image style={styles.circleImage} source={require('../../assets/User.png')} />
        </View>
        <View>
          {sessionData && (
            <>
            <Text style = {styles.gameCodeText}>Game Code: {userData?.currentSession || "None"}</Text>
            <Text style = {styles.gameCodeText}>Points: {points}</Text>
            </>
          )}
        </View>
        <View style={styles.buttonsContainer}>
          <BasicButton text={'See Past Results'} backgroundColor={COLORS.navy} textColor={COLORS.beige} onPress={() => navigation.navigate('PastResultsScreen')}/>
          <BasicButton text={'Notifications'} backgroundColor={COLORS.navy} textColor={COLORS.beige} />
          <BasicButton 
            text={leavingSession ? 'Leaving...' : 'Leave Session'} 
            backgroundColor={COLORS.navy} 
            textColor={COLORS.beige}
            disabled={leavingSession || !userData?.currentSession}
            onPress={handleLeaveSession}
          />
          <BasicButton 
            text={'Log Out'} 
            backgroundColor={COLORS.navy} 
            textColor={COLORS.beige} 
            onPress={handleLogout}  // Add the onPress handler for logout
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  usernameText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.heading,
    color: COLORS.navy,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editImage: {
    height: 23,
    width: 23,
  },
  saveButtonText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  circle: {
    height: 200,
    width: 200,
    backgroundColor: COLORS.gray,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleImage: {
    width: '50%',
    height: '50%',
  },
  gameCodeText: {
    fontFamily: 'Figtree_400Regular',
    color: COLORS.navy,
    fontSize: SIZES.body,
    marginVertical: 10,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.navy,
    padding: 8,
    borderRadius: 8,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
    color: COLORS.navy,
    width: 200,
  },
});

export default SettingsScreen;