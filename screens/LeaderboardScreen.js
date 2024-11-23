import React from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'
import BackButton from '../components/BackButton';



const LeaderboardScreen = ({ navigation }) => {
	//load font
	const [fontsLoaded] = useFonts({
		Figtree_400Regular,
		Figtree_600SemiBold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<SafeAreaView style={styles.screen} edges={['left', 'right']}>
			<View style={styles.container}>
				<BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.goBack()} />
                <Text style={styles.title}>Session Name</Text>
			</View>
		</SafeAreaView>
	)
}

export default LeaderboardScreen

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		fontFamily: 'Figtree_600SemiBold',
		backgroundColor: COLORS.beige,
	},
	title: {
		fontFamily: 'Figtree_400Regular',
		fontSize: 40,
		color: COLORS.navy,
		textAlign: 'center',
	},
});
