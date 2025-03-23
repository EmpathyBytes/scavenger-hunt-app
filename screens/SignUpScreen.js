import React, { useState } from 'react';
import { 
  StyleSheet, ImageBackground, Image, Text, View, TextInput, 
  ActivityIndicator, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';


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
			  <View style={styles.signUpBox}>
				<Text style={styles.title}>Welcome!</Text>
				<Text style={styles.subtitle}>Create an account to begin your quest!</Text>
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
					style={styles.signUpButton}
					backgroundColor={COLORS.navy}
					textColor={COLORS.beige}
					onPress={handleSignUp}
				  />
				)}
				<Text style={styles.logInText}>
				  Already have an account?{' '}
				  <Text style={styles.signupLink} onPress={() => navigation.navigate('LogInScreen')}>
					Log in!
				  </Text>
				</Text>
			  </View>
			</View>
		  </ImageBackground>
		</View>
	  );
	};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Figtree_600SemiBold',
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
    height: 100,
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
  box: {
    backgroundColor: COLORS.beige,
    borderRadius: 20,
    alignSelf: 'center',
    zIndex: 2,
    height: 520,
    marginTop: 180,
  },
  signUpBox: {
    position: 'center',
    top: '22.5%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.title,
    color: COLORS.navy,
    width: '70%',
    paddingBottom: 100,
    marginTop: -100,
    marginBottom: 5,
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: SIZES.body,
    fontFamily: 'Figtree_400Regular',
    color: COLORS.darkGray,
    marginTop: -70,
    marginBottom: 30,
    textAlign: 'center',
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: SIZES.body_small,
    textAlign: 'center',
    marginBottom: 10,
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
  signUpButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
    width: '50%',
  },
});