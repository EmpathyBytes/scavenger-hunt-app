import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton'
import BackButton from '../components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

const LogInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  // Email validation using regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    // Reset error state
    setError('');
    
    // Trim inputs to remove any accidental spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validate inputs
    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      navigation.navigate('JoinSessionScreen');
    } catch (error) {
      // Focus on the most common Firebase error codes
      switch(error.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later');
          break;
        default:
          setError('Login failed. Please try again.');
          console.log("Firebase auth error:", error.code, error.message);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
      <View style={styles.container}>
        <ImageBackground
          style={styles.map}
          source={require('../assets/map.png')}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, .1)', 'rgba(255, 249, 217, 1)']}
            style={styles.gradient}
          />
          <Image
            style={styles.bee}
            source={require('../assets/bee.png')}
          />
          <Image
            style={styles.mapLine}
            source={require('../assets/map-line.png')}
          />
          <View style={styles.box}>
            <View style={[styles.logInBox, { alignItems: 'center' }]}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Log in to continue your quest!</Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TextInput
                placeholder="Email"
                placeholderTextColor="#B0B0B0"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#B0B0B0"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              {loading ? (
                <ActivityIndicator size="large" color={COLORS.navy} />
              ) : (
                <View style={{width: '100%', alignItems: 'center'}}>
                  <BasicButton
                    text="Log In"
                    style={styles.logInButton}
                    backgroundColor={COLORS.navy}
                    textColor={COLORS.beige}
                    onPress={handleLogin}
                    disabled={loading}
                  />
                  <Text style={styles.logInText}>
                    Don't have an account?{' '}
                    <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUpScreen')}>
                      Sign up
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Image
            style={styles.cross}
            source={require('../assets/cross.png')}
          />
          <View style={styles.button} pointerEvents="none">
            <BasicButton
              text="Play"
              backgroundColor={COLORS.navy}
              textColor={COLORS.beige}
              //onPress={() => navigation.navigate('LogInScreen')
            />
          </View>
        </ImageBackground>
      </View>
    );
  };


  export default LogInScreen;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      fontFamily: 'Figtree_600SemiBold',
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
      width: '70%',
      paddingBottom: 100,
      marginTop: -75,
      marginBottom: 5,
      textAlign: 'center',
      alignSelf: 'center'
    },
    subtitle: {
    	fontSize: SIZES.body,
    	fontFamily: 'Figtree_400Regular',
    	color: COLORS.darkGray,
    	marginTop: -70,
    	marginBottom: 30,
    	textAlign: 'center',
    	alignSelf: 'center'
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
      alignSelf: 'center'
    },
    logInText: {
      marginBottom: 200,
      fontFamily: 'Figtree_400Regular',
      fontSize: SIZES.body_small,
      textAlign: 'center',
      marginTop: 10,
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
      height: 120,
      objectFit: 'contain',
      position: 'absolute',
      alignSelf: 'center',
      top: '15%',
      zIndex: 0,
      opacity: 0.7,
    },
    mapLine: {
        alignSelf: 'center',
        height: 550,
        objectFit: 'contain',
        position: 'absolute',
        top: '25%',
        zIndex: 0,
        opacity: 0.5,
      },
    cross: {
      height: 110,
      width: 110,
      objectFit: 'contain',
      alignSelf: 'center',
      zIndex: 1,
      marginTop: -30,
      position: 'absolute',
      bottom: '3.6%',
      opacity: 0.9,
    },
    map: {
      flex: 1,
    },
    gradient: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    logInBox: {
      position: 'center',
      top: '22.5%',
      },
    button: {
      width: '30%',
      zIndex: 2,
      alignItems: 'center',
      alignSelf: 'center',
      position: 'absolute',
      bottom: '7%',

    },
    box: {
      backgroundColor: COLORS.beige,
      borderRadius: 20,
      alignSelf: 'center',
      zIndex: 2,
      height: 500,
      marginTop: 180,
    },
    logInButton: {
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      //flex: 1,
      width: '80%',
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