import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Alert, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';
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
        
        <View style={styles.content}>
          <Image
            style={styles.bee}
            source={require('../assets/bee.png')}
          />
          
          <Image
            style={styles.mapLine}
            source={require('../assets/map-line.png')}
          />
          
          <View style={styles.box}>
            <View style={styles.logInBox}>
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
                <View style={styles.actionContainer}>
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
        </View>
      </ImageBackground>
    </View>
  );
};

export default LogInScreen;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Figtree_600SemiBold',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
  },
  map: {
    flex: 1,
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bee: {
    width: width * 0.3,
    height: height * 0.15,
    resizeMode: 'contain',
    marginBottom: -height * 0.02,
    zIndex: 1,
  },
  mapLine: {
    width: width * 0.8,
    height: height * 0.6,
    resizeMode: 'contain',
    position: 'absolute',
    top: height * 0.2,
    zIndex: 0,
    opacity: 0.5,
  },
  box: {
    backgroundColor: COLORS.beige,
    borderRadius: 20,
    width: width * 0.85,
    paddingVertical: height * 0.04,
    maxHeight: height * 0.65,
    zIndex: 2,
  },
  logInBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },
  title: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.title,
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: SIZES.body,
    fontFamily: 'Figtree_400Regular',
    color: COLORS.darkGray,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    height: height * 0.06,
    borderColor: COLORS.darkGray,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: height * 0.02,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logInButton: {
    width: '90%',
  },
  logInText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    textAlign: 'center',
    marginTop: height * 0.02,
  },
  signupLink: {
    color: COLORS.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    marginBottom: height * 0.02,
    textAlign: 'center',
    width: '90%',
  },
  cross: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: 'contain',
    marginTop: -height * 0.02,
    zIndex: 1,
  },
});