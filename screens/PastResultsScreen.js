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
			<LinearGradient
                colors={['rgba(255, 255, 255, .1)', 'rgba(255, 249, 217, 1)']}
                style={styles.gradient}
            />
		</View>
	)
}

export default WelcomeScreen

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		fontFamily: 'Figtree_600SemiBold',
	},
	gradient: {
		width: '100%',
		height: '20%',
		position: 'absolute',
	},
});
