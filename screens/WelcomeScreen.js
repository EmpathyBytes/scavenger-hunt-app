import React from 'react'
import { StyleSheet, ImageBackground, Image, Text, View, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'
import BasicButton from '../components/BasicButton';

const WelcomeScreen = ({ navigation }) => {
	//load font
	const [fontsLoaded] = useFonts({
		Figtree_400Regular,
		Figtree_600SemiBold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<View style={styles.screen} edges={['left', 'right']}>
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
						source={require('../assets/bee.png')}/>
					<Image 
						style={styles.mapLine}
						source={require('../assets/map-line.png')}/>
					<Image 
						style={styles.cross}
						source={require('../assets/cross.png')}/>
					<Text style={styles.title}>BuzzQuest</Text>
				</View>
				<View style={styles.button}>
					<BasicButton
						text="Play"
						backgroundColor={COLORS.navy}
						textColor={COLORS.beige}
						onPress={() => navigation.navigate('LogInScreen')}/>
				</View>
			</ImageBackground>
		</View>
	)
}

export default WelcomeScreen

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		fontFamily: 'Figtree_600SemiBold',
	},
	map: {
		flex: 1,
	},
	content: {
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignContent: 'center',
	},
	bee: {
		height: 120,
		objectFit: 'contain',
		alignSelf: 'center',
		zIndex: 1,
		marginTop: 150,
		marginBottom: -50,
		marginLeft: 30,
	},
	mapLine: {
		alignSelf: 'center',
		height: 570,
		objectFit: 'contain',
	},
	cross: {
		height: 110,
		width: 110,
		objectFit: 'contain',
		alignSelf: 'center',
		zIndex: 1,
		marginTop: -30,
	},
	gradient: {
		width: '100%',
		height: '100%',
		position: 'absolute',
	},
	title: {
		fontSize: SIZES.title, 
		fontFamily: 'Figtree_400Regular',
		color: COLORS.navy,
		zIndex: 2,
		alignSelf: 'center',
		marginTop: -275,
		marginBottom: 360,
	},
	button: {
		width: '30%',
		zIndex: 2,
		alignItems: 'center',
		alignSelf: 'center',
		marginTop: -140,
	},
});
