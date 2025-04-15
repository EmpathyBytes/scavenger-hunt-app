import React, { useState, useEffect } from 'react'
import { Text, View, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../components/theme'; //colors and sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BasicButton from '../../components/BasicButton';
import { useAuth } from '../../contexts/AuthContext';
import { useServices } from '../../contexts/ServiceContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { userService, sessionService } = useServices();
  
  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leavingSession, setLeavingSession] = useState(false);
  
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
        [{ text: "OK", onPress: () => navigation.navigate("JoinSessionScreen") }]
      );
      
    } catch (error) {
      console.error("Error leaving session:", error);
      Alert.alert("Error", error.message || "Failed to leave session. Please try again.");
    } finally {
      setLeavingSession(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 13 }}>
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameText}> {userData?.displayName || "Username"} </Text>
        <Image style={styles.editImage} source={require('../../assets/Edit.png')} />
      </View>
      <View style={styles.circle}>
        <Image style={styles.circleImage} source={require('../../assets/User.png')} />
      </View>
      <View>
        {sessionData && (
          <Text style={styles.gameCodeText}> 
            Game Code: {userData?.currentSession || "None"} 
          </Text>
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
        <BasicButton text={'Log Out'} backgroundColor={COLORS.navy} textColor={COLORS.beige} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  usernameText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.heading,
    color: COLORS.navy,
  },
  editImage: {
    // borderColor: 'red',
    // borderWidth: 2,
    height: 23,
    width: 23
  },
  circle: {
    height: 200,
    width: 200,
    backgroundColor: COLORS.gray,
    borderRadius: "100%",
  },
  circleImage: {
    margin: 'auto',
    width: '50%',
    height: '50%',
  },
  gameCodeText: {
    fontFamily: 'Figtree_400Regular',
    color: COLORS.navy,
    fontSize: SIZES.body_small,
    //fontWeight: '600',
    marginVertical: 10
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12
  },
});

export default SettingsScreen