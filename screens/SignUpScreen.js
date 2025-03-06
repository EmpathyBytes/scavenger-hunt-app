import React from 'react';
import { StyleSheet, ImageBackground, Image, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';

const SignUpScreen = ({ navigation }) => {
	const [fontsLoaded] = useFonts({
		Figtree_400Regular,
		Figtree_600SemiBold,
	});

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

				{/* Bee Icon */}
				<Image 
					style={styles.bee}
					source={require('../assets/bee.png')}
				/>

				{/* Map Line */}
				<Image 
					style={styles.mapLine}
					source={require('../assets/map-line.png')}
				/>

				{/* Sign-Up Box */}
				<View style={styles.signUpBox}>
					<Text style={styles.title}>Welcome!</Text>
					<Text style={styles.subtitle}>Create an account to begin your quest!</Text>

					{/* Email Input */}
					<TextInput
						style={styles.input}
						placeholder="Email"
						placeholderTextColor="#666"
					/>

					{/* Password Input */}
					<TextInput
						style={styles.input}
						placeholder="Password"
						placeholderTextColor="#666"
						secureTextEntry
					/>

					{/* Sign-Up Button */}
					<TouchableOpacity style={styles.signUpButton} onPress={() => {/* Handle sign-up */}}>
						<Text style={styles.buttonText}>Sign up</Text>
					</TouchableOpacity>

					{/* Log In Link */}
					<Text style={styles.loginText}>
						Already have an account?{' '}
						<Text style={styles.loginLink} onPress={() => navigation.navigate('LogInScreen')}>
							Log in!
						</Text>
					</Text>
				</View>

				{/* Red 'X' Behind Play Button */}
				<Image 
					style={styles.cross}
					source={require('../assets/cross.png')}
				/>

				{/* Play Button */}
				<View style={styles.button}>
					<BasicButton
						text="Play"
						backgroundColor={COLORS.navy}
						textColor={COLORS.beige}
						onPress={() => navigation.navigate('LogInScreen')}
					/>
				</View>

			</ImageBackground>
		</View>
	);
};

export default SignUpScreen;

const styles = StyleSheet.create({
	screen: {
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
		height: 120,
		objectFit: 'contain',
		position: 'absolute',
		alignSelf: 'center',
		top: '15%',
		zIndex: 1,    
		opacity: 0.7, 
	},
	mapLine: {
		alignSelf: 'center',
		height: 550,
		objectFit: 'contain',
		position: 'absolute',
		top: '25%',  
		zIndex: 1,   
		opacity: 0.5, 
	},
	signUpBox: {
		position: 'absolute',
		top: '22.5%',  
    bottom: '22%',
		alignSelf: 'center',
		width: '85%',
		backgroundColor: COLORS.beige,
		padding: 20,
		borderRadius: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,  
		alignItems: 'center',
		zIndex: 2,  
	},
	title: {
		fontSize: SIZES.title,
		fontFamily: 'Figtree_600SemiBold',
		color: COLORS.navy,
		marginBottom: 5,
	},
	subtitle: {
		fontSize: SIZES.body,
		fontFamily: 'Figtree_400Regular',
		color: COLORS.darkGray,
		marginBottom: 20,
		textAlign: 'center',
	},
	input: {
		width: '100%',
		height: 45,
		backgroundColor: '#fff',
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: COLORS.gray,
	},
	signUpButton: {
		backgroundColor: COLORS.navy,
		paddingVertical: 12,
		width: '100%',
		borderRadius: 10,
		alignItems: 'center',
	},
	buttonText: {
		color: COLORS.beige,
		fontSize: 16,
		fontFamily: 'Figtree_600SemiBold',
	},
	loginText: {
		marginTop: 15,
		fontSize: 14,
		color: COLORS.darkGray,
	},
	loginLink: {
		color: COLORS.navy,
		fontFamily: 'Figtree_600SemiBold',
	},
	/* Play Button */
	button: {
		width: '30%',
		zIndex: 2,
		alignItems: 'center',
		alignSelf: 'center',
		position: 'absolute',
		bottom: '7%',
	},
	/* 'X' */
	cross: {
		height: 110,
		width: 110,
		objectFit: 'contain',
		position: 'absolute',
		alignSelf: 'center',
		bottom: '3.6%',
		zIndex: 1,
		opacity: 0.9, 
	},
});