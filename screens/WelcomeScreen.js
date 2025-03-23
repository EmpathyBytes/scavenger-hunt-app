import React from 'react'
import { StyleSheet, ImageBackground, Image, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
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
				<TouchableOpacity style={styles.infoIconWrap} onPress={() => navigation.navigate('AboutUsScreen')}>
					<Image
						style={styles.infoIcon}
						source={require('../assets/info-button.png')}/>
				</TouchableOpacity>
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
		alignContent: 'center',
		justifyContent: 'center',
	},
	content: {
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignContent: 'center',
		top: "-25%",
		//marginTop: -60,
	},
	bee: {
		height: 120,
		objectFit: 'contain',
		alignSelf: 'center',
		zIndex: 1,
		//marginTop: 150,
		//top: "1%",
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
		//marginBottom: "70%",
	},
	button: {
		width: '30%',
		zIndex: 2,
		alignItems: 'center',
		alignSelf: 'center',
		marginTop: "-30%",
		bottom: "10.66%",
		//position: "absolute",
		padding: 0,
	},
	infoIcon: {
		height: 50,
		width: 50,
		alignSelf: 'center',
		zIndex: 3,
		objectFit: 'contain',
	},
	infoIconWrap: {
		alignSelf: 'center',
		zIndex: 3,
		//width: 10,
		//marginTop: 40,
		left: "40%",
		objectFit: 'contain',
	}
});
