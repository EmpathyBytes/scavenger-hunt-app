import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Alert, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';import { COLORS, SIZES, SPACING } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton'
import Input from '../components/Input';
import BackButton from '../components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

import { useServices } from '../contexts/ServiceContext';

const LogInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { userService } = useServices();
  
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

      // Temp fix: Since migrating to updated_node and services, create new user in realtime database if auth exists
      
      const userExists = await userService.getUser(userCredential.user.uid);
      if (!userExists) {
        const userId = userCredential.user.uid;
        await userService.createUser(userId);
        await userService.setEmail(userId, trimmedEmail);
      }

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
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to continue your quest!</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} marginBottom={SPACING.xl} width="100%"></Input>

            <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} editable={!loading}  marginBottom={SPACING.xl} width="100%"></Input>
            
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    fontFamily: 'Figtree_600SemiBold',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "100%",
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.v,
    paddingBottom: SPACING.lg,
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
    width: 256,
    height: 128,
    resizeMode: 'contain',
    marginBottom: SPACING.v,
    zIndex: 1,
  },
  mapLine: {
    width: 1000,
    height: 664,
    resizeMode: 'contain',
    position: 'absolute',
    marginTop: 112,
    zIndex: 0,
    opacity: 0.5,
  },
  box: {
    backgroundColor: COLORS.beige,
    borderRadius: SIZES.radius_container,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xxl,
    width: "100%",
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.title,
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  subtitle: {
    fontSize: SIZES.body,
    fontFamily: 'Figtree_400Regular',
    color: COLORS.darkGray,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  actionContainer: {
    width: "100%",
    alignItems: 'center',
  },
  logInText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  signupLink: {
    color: COLORS.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    width: '90%',
  },
  cross: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
    marginTop: SPACING.sm,
    zIndex: 1,
  },
});
