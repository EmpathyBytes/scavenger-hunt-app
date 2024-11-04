import React from 'react'
import { StyleSheet, ImageBackground, Button, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
		<LinearGradient
				colors={['rgba(255, 255, 255, .1)', 'rgba(255, 249, 217, 1)']}
				style={styles.gradient}
			/>
		<ImageBackground
			style={styles.map}
			source={require('../assets/map.png')}
		>
				<Button
					title="Log in"
					onPress={() => navigation.navigate('LogInScreen')}
					style={styles.button} />
		</ImageBackground>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
	container: {
		flex: 1, 
		alignItems: 'center', 
		justifyContent: 'center',
		backgroundColor: 'red',
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 0,
	},
	map: {
		width: '100%',
		height: '120%',
		opacity: 1,
		zIndex: 1,
	},
	button: {
		position: 'absolute',
		zIndex: 3,
		width: '40px',
		height: 'auto',
	},
	gradient: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		zIndex: 2,
	}
  });