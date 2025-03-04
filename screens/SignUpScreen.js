import React, { useState } from 'react';
import { 
  Image, Text, TextInput, View, StyleSheet, 
  TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import BackButton from '../components/BackButton';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Password validation - minimum 8 chars, at least 1 number, 1 special character
  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return re.test(password);
  };

  const handleSignUp = async () => {
    // Reset error state
    setError('');

    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters with at least one letter, one number, and one special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Attempt to create user
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Success - User is created
      Alert.alert('Success', 'Your account has been created successfully!');
      navigation.navigate('JoinSessionScreen');
    } catch (error) {
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already in use');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        default:
          setError('Failed to create account: ' + error.message);
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
      <Text style={styles.title}>Create Account</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        placeholder="Email"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.navy} />
      ) : (
        <BasicButton
          text="Sign Up"
          backgroundColor={COLORS.navy}
          textColor={COLORS.beige}
          onPress={handleSignUp}
        />
      )}
      
      <Text style={styles.body}>
        Welcome to the club!
      </Text>
    </View>
  );
};

export default SignUpScreen;

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
  body: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    width: '60%',
    //paddingBottom: 100,
    marginTop: 20,
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