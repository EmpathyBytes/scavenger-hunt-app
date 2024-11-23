import React from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'
import BackButton from '../components/BackButton';
import Entypo from '@expo/vector-icons/Entypo';

// eventually, pull this array from Firebase
const results = [
	{
		id: 1,
		name: 'CS 1100 Fall 2024',
		winner: 'Team 4',
		yourStanding: 4,
		yourScore: 10,
	},
	{
		id: 2,
		name: 'CS 1100 Spring 2024',
		winner: 'Team 30',
		yourStanding: 6,
		yourScore: 15,
	},
	{
		id: 3,
		name: 'CS 1100 Fall 2023',
		winner: 'Team 19',
		yourStanding: 2,
		yourScore: 20,
	},
	{
		id: 4,
		name: 'CS 1100 Spring 2023',
		winner: 'Team 1',
		yourStanding: 1,
		yourScore: 22,
	},
	{
		id: 5,
		name: 'CS 1100 Fall 2022',
		winner: 'Team 1',
		yourStanding: 1,
		yourScore: 22,
	},
	{
		id: 6,
		name: 'CS 1100 Spring 2022',
		winner: 'Team 1',
		yourStanding: 1,
		yourScore: 22,
	},
];

const Item = ({ item, navigation }) => (
	<TouchableOpacity style={styles.session} onPress={() => navigation.navigate('LeaderboardScreen', { sessionID: item.id})}>
		<View>
			<Text style={styles.sessionTitle}>
				{item.name}
			</Text>
			<Text style={styles.sessionText}>
				{item.winner}{"\n"}
				{"Your Standing: " + item.yourStanding}{"\n"}
				{"Your Score: " + item.yourScore}
			</Text>
		</View>
		<View style={styles.rightChevron}>
			<Entypo name="chevron-right" size={30} color="white" style={{ strokeWidth: 1 }} />
		</View>
	</TouchableOpacity>
  );


const PastResultsScreen = ({ navigation }) => {
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
				<FlatList
					data={results}
					renderItem={({item}) => <Item item={item} navigation={navigation} />}
					keyExtractor={item => item.id}
					contentContainerStyle={{ paddingBottom:150 }} 
				/>
			</View>
			<LinearGradient
                colors={['rgba(255, 255, 255, 0)','rgba(255, 249, 217, 1)']}
				locations={[0, .6]}
                style={styles.gradient}>
				<Text style={styles.title}>
					Past Games
				</Text>
			</LinearGradient>
		</SafeAreaView>
	)
}

export default PastResultsScreen

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		fontFamily: 'Figtree_600SemiBold',
		backgroundColor: COLORS.beige,
	},
	gradient: {
		width: '100%',
		height: '20%',
		position: 'absolute',
		bottom: 0,
	},
	title: {
		fontFamily: 'Figtree_400Regular',
		fontSize: 40,
		color: COLORS.navy,
		textAlign: 'center',
		paddingTop: '17%',
	},
	container: {
		gap: 10,
	},
	session: {
		color: 'white',
		backgroundColor: COLORS.navy,
		borderRadius: 17,
		padding: 20,
		paddingRight: 15,
		marginBlock: 10,
		marginHorizontal: 35,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	sessionTitle: {
		fontFamily: 'Figtree_400Regular',
		color: 'white',
		fontSize: 20,
		fontWeight: 500,
		marginBottom: 10,
	},
	sessionText: {
		fontFamily: 'Figtree_400Regular',
		color: 'white',
		fontSize: 17,
		lineHeight: 25,
	},
	rightChevron: {
		marginBlock: 'auto',
	},
});
