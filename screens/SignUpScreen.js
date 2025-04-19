import React, { useState } from 'react';
import { 
  StyleSheet, ImageBackground, Image, Text, View, TextInput, 
  ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase_config';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import { useServices } from '../contexts/ServiceContext';

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
  
	const screenHeight = Dimensions.get('window').height;

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
		// 1. Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Get the Firebase user ID (uid) from the user credential
      const firebaseUserId = userCredential.user.uid;
      
      // 3. Create a user record in the database using Firebase UID
      await createUserInDatabase(firebaseUserId, email.trim());
      
      // 4. Show success message and navigate
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
  
  /**
   * Creates a user record in the database after successful Firebase authentication
   * 
   * @param {string} userId - The Firebase user ID (uid)
   * @param {string} userEmail - The user's email address
   */
  const createUserInDatabase = async (userId, userEmail) => {
    try {
      // Create the user in our database using UserService with Firebase uid
      await userService.createUser(userId);
      
      // Set the email field separately
      await userService.setEmail(userId, userEmail);
      
      console.log('User created in database successfully with Firebase UID');
    } catch (error) {
      console.error('Error creating user in database:', error);
      // Don't throw error here - we want to consider signup successful
      // even if there's an issue with the database record,
      // as the authentication account was created
    }
  };
  
  if (!fontsLoaded) {
    return null;
  }
  
	return (
		<View style={styles.screen}>
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
			  <Image style={styles.bee} source={require('../assets/bee.png')}/>
			  <Image style={styles.mapLine} source={require('../assets/map-line.png')}/>
			  <Image style={styles.cross} source={require('../assets/cross.png')}/>
			</View>
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

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		fontFamily: 'Figtree_600SemiBold',
	},
	map: {
		flex: 1,
		alignContent: 'center',
		justifyContent: 'center',
	},
	content: {
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignContent: 'center',
	},
	bee: {
		height: '15%',
		objectFit: 'contain',
		alignSelf: 'center',
		zIndex: 1,
		marginBottom: -50,
		marginLeft: 30,
	},
	mapLine: {
		alignSelf: 'center',
		height: '76%',
		objectFit: 'contain',
	},
	cross: {
		height: '12%',
		width: '20%',
		objectFit: 'contain',
		alignSelf: 'center',
		zindex: 1,
	},
	gradient: {
		width: '100%',
		height: '100%',
		position: 'absolute',
	},
	box: {
		backgroundColor: COLORS.beige,
		borderRadius: 20,
		alignSelf: 'center',
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2,
		width: width*.9,
		marginTop: (height-550)/2,
	},
	signUpBox: {
		width: '90%',
		alignItems: 'center',
		padding: width * 0.05,
	},
	title: {
		fontFamily: 'Figtree_400Regular',
		fontSize: width * 0.09,
		color: COLORS.navy,
		textAlign: 'center',
		marginBottom: height * 0.02,
		zIndex: 2,
	},
	subtitle: {
		fontSize: width * 0.05,
		fontFamily: 'Figtree_400Regular',
		color: COLORS.darkGray,
		textAlign: 'center',
		marginBottom: height * 0.03,
	},
	input: {
		width: '85%',
		height: height * 0.06,
		borderColor: COLORS.darkGray,
		borderWidth: 2,
		borderRadius: 15,
		paddingHorizontal: width * 0.04,
		fontSize: width * 0.04,
		marginBottom: height * 0.02,
	},
	errorText: {
		color: 'red',
		fontSize: SIZES.body_small,
		textAlign: 'center',
		marginBottom: 10,
	},
	logInText: {
		fontSize: width * 0.04,
		textAlign: 'center',
		marginTop: height * 0.015,
		marginBottom: height * 0.05,
	},
	signupLink: {
		color: COLORS.primary,
		fontFamily: 'Figtree_600SemiBold',
	},
	signUpButton: {
		width: '60%',
		height: height * 0.06,
		justifyContent: 'center',
		alignItems: 'center',
	},
});