import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useServices } from '../contexts/ServiceContext';
import { createSession } from './adminHelpers';
import CheckBox from '@react-native-community/checkbox';
import BasicButton from '../components/BasicButton';
import BackButton from '../components/BackButton';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';

const CreateSessionScreen = ({ navigation }) => {

  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const { user, isAuthenticated } = useAuth();
  const { userService } = useServices();
  const { sessionService } = useServices();

  const [sessionName, setSessionName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);


  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' }],
      });
      return;
    }
    const fetchUserData = async () => {
      try {
        if (user && user.uid) {
          const userDataFromDB = await userService.getUser(user.uid);
          setUserData(userDataFromDB);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, userService]);


  const handleCreateSession = async () => {
    if (!userData) {
      console.log("1", user.uid);
      console.log("2", userData);
      console.log("3", userData.id);
      console.error("User data not available");
      return;
    }

    try {
      const sessionData = {
        sessionName: sessionName,
        creatorId: user.uid,
        sessionId: userData.id,
        isActive: true,
        startTime: parseInt(startTime, 10),
        endTime: parseInt(endTime, 10),
      };
  
      const sessionId = await createSession(sessionService, user.uid, sessionData);
      console.log("Session created successfully with ID:", sessionId);
      Alert.alert('Success', `Session "${sessionName}" created successfully!`);
      navigation.goBack(); // Navigate back after creating the session
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>
      <Image style={styles.bee} source={require('../assets/bee.png')} />
      <Text style={styles.title}>Create a New Session</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        placeholder="Session Name"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        value={sessionName}
        onChangeText={setSessionName}
      />
      <TextInput
        placeholder="Start Time (e.g., 0)"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        value={startTime}
        onChangeText={setStartTime}
      />
      <TextInput
        placeholder="End Time (e.g., 60)"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        value={endTime}
        onChangeText={setEndTime}
      />
      <BasicButton
        text="Create Session"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={handleCreateSession}
      />
    </View>
  );
};

export default CreateSessionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 45,
  },
  backButton: {
    fontSize: 18,
    color: COLORS.darkGray,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.title,
    color: COLORS.navy,
    width: '60%',
    paddingBottom: 100,
    // marginTop: 10,
    // marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: COLORS.darkGray,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  signupText: {
    marginTop: 20,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    textAlign: 'center',
  },
  signupLink: {
    color: COLORS.primary,
    fontFamily: 'Figtree_600SemiBold',
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
  errorText: {
    color: 'red',
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    marginBottom: 10,
    textAlign: 'center',
    width: '80%',
  },
});
