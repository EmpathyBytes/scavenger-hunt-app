import React, { useState, useRef, useEffect } from 'react';
import { Image, Text, View, StyleSheet, TextInput } from 'react-native';
import { COLORS, SIZES } from '../components/theme'; 
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'; 
import BasicButton from '../components/BasicButton';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { useServices } from '../contexts/ServiceContext';

const JoinSessionScreen = ({ navigation }) => {
  // Use the auth context to access the authenticated user's UID
  const { user, isAuthenticated } = useAuth();
  
  // Use the services context to access the UserService
  const { userService } = useServices();
  
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });
  
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

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
    if (value === 'enter game code') {
      setValue('');
    }
  };

  if (!fontsLoaded || loading) {
    return null;
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
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onFocus={handleFocus}
        placeholder="Enter Super Secret Game Code"
        maxLength={10}
      />
      </View>
      <BasicButton
        text="Join Game"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('HomeScreen')}/>
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
  inputcontainer: {
    padding: 17,
    paddingTop: 70,
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
});

export default JoinSessionScreen;