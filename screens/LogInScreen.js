import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from '../services/UserService';
import { auth } from '../firebase_config';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton'
import BackButton from '../components/BackButton';
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
      const userId = userCredential.user.uid;
  
      // Use UserService to fetch user data
      const userData = await userService.getUser(userId);
  
      if (userData) {
        if (userData.isAdmin) {
          navigation.navigate('AdminControlsScreen');
        } else {
          navigation.navigate('JoinSessionScreen');
        }
      } else {
        setError('User data not found');
      }
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
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.goBack()} />
      </View>
      <Image
        style={styles.bee}
        source={require('../assets/bee.png')}/>
      <Text style={styles.title}>Welcome Back</Text>
      
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
        <BasicButton 
          text="Log In"
          backgroundColor={COLORS.navy}
          textColor={COLORS.beige}
          onPress={handleLogin}
          disabled={loading}
        />
      )}
      <Text style={styles.signupText}>
        Don't have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUpScreen')}>
          Sign up
        </Text>
      </Text>
    </View>
  );
};

export default LogInScreen;

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
