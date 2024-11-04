import React from 'react'
import { StyleSheet, ImageBackground, TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.screen}>
		<ImageBackground
			style={styles.map}
			source={require('../assets/map.png')}
		>
			<View style={styles.content}>
				<Text style={styles.title}>BuzzQuest</Text>
				<TouchableOpacity
					onPress={() => navigation.navigate('LogInScreen')}
					style={styles.button}
				>
					<Text style={{color: 'white', fontSize: 20, textAlign: 'center',}}>Play</Text>
				</TouchableOpacity>
			</View>
			<LinearGradient
					colors={['rgba(255, 255, 255, .1)', 'rgba(255, 249, 217, 1)']}
					style={styles.gradient}
				/>
		</ImageBackground>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
	screen: {
		flex: 1, 
		alignItems: 'center', 
		justifyContent: 'center',
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	map: {
		width: '100%',
		height: '120%',
		opacity: 1,
		zIndex: 1,
	},
	gradient: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		zIndex: 2,
	},
	content: {
		position: 'absolute',
		top: '60%',
		alignSelf: 'center',
		zIndex: 3,
	},
	title: {
		fontSize: 40, 
		fontWeight: '600',
		color: 'rgba(24, 46, 81, 1)',
		marginBottom: '25%',
	},
	button: {
		alignSelf: 'center',
		width: 110,
		height: 'auto',
		paddingVertical: 9,
		borderRadius: 17,
		backgroundColor: 'rgba(24, 46, 81, 1)',
		color: 'white',
	}
  });