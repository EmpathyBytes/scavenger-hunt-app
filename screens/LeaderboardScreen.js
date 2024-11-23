import React from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'
import BackButton from '../components/BackButton';

// eventually, pull this array from Firebase
const results = [
	{
		id: 1,
		name: 'CS 1100 Fall 2024',
		winner: 'Team 4',
		yourStanding: 4,
		yourScore: 10,
        teams: [
            {
                name: 'Team 1',
                score: 5,
            },
            {
                name: 'Team 2',
                score: 4,
            },
            {
                name: 'Team 3',
                score: 3,
            },
            {
                name: 'Team 4',
                score: 2,
            },
            {
                name: 'Team 5',
                score: 1,
            },
        ]
	},
	{
		id: 2,
		name: 'CS 1100 Spring 2024',
		winner: 'Team 30',
		yourStanding: 6,
		yourScore: 15,
        teams: [
            {
                name: 'Team 1',
                score: 5,
            },
            {
                name: 'Team 2',
                score: 4,
            },
            {
                name: 'Team 3',
                score: 3,
            },
            {
                name: 'Team 4',
                score: 2,
            },
            {
                name: 'Team 5',
                score: 1,
            },
        ]
	},
	{
		id: 3,
		name: 'CS 1100 Fall 2023',
		winner: 'Team 19',
		yourStanding: 2,
		yourScore: 20,
        teams: [
            {
                name: 'Team 1',
                score: 5,
            },
            {
                name: 'Team 2',
                score: 4,
            },
            {
                name: 'Team 3',
                score: 3,
            },
            {
                name: 'Team 4',
                score: 2,
            },
            {
                name: 'Team 5',
                score: 1,
            },
        ]
	},
	{
		id: 4,
		name: 'CS 1100 Spring 2023',
		winner: 'Team 1',
		yourStanding: 1,
		yourScore: 22,
        teams: [
            {
                name: 'Team 1',
                score: 5,
            },
            {
                name: 'Team 2',
                score: 4,
            },
            {
                name: 'Team 3',
                score: 3,
            },
            {
                name: 'Team 4',
                score: 2,
            },
            {
                name: 'Team 5',
                score: 1,
            },
        ]
	},
	{
		id: 5,
		name: 'CS 1100 Fall 2022',
		winner: 'Team 1',
		yourStanding: 1,
		yourScore: 22,
        teams: [
            {
                name: 'Team 1',
                score: 5,
            },
            {
                name: 'Team 2',
                score: 4,
            },
            {
                name: 'Team 3',
                score: 3,
            },
            {
                name: 'Team 4',
                score: 2,
            },
            {
                name: 'Team 5',
                score: 1,
            },
        ]
	},
	{
		id: 6,
		name: 'CS 1100 Spring 2022',
		winner: 'Team 1',
		yourStanding: 1,
		yourScore: 22,
        teams: [
            {
                name: 'Team 1',
                score: 5,
            },
            {
                name: 'Team 2',
                score: 4,
            },
            {
                name: 'Team 3',
                score: 3,
            },
            {
                name: 'Team 4',
                score: 2,
            },
            {
                name: 'Team 5',
                score: 1,
            },
        ]
	},
];

const Item = ({ item }) => (
	// <TouchableOpacity style={styles.session} onPress={onPress}>
	<View>
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
	</View>
  );

const LeaderboardScreen = ({ navigation, route }) => {
	//load font
	const [fontsLoaded] = useFonts({
		Figtree_400Regular,
		Figtree_600SemiBold,
	});

	if (!fontsLoaded) {
		return null;
	}

    // use paramerter session id to query relevant data from Firebase
    const { sessionID } = route.params;
    const sessionData = results.find(item => item.id === sessionID);
    const teams = sessionData.teams.sort((a,b) => b.score - a.score)

	return (
		<SafeAreaView style={styles.screen} edges={['left', 'right']}>
			<View style={styles.container}>
				<BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.goBack()} />
                <Text style={styles.title}>{sessionData.name}</Text>
                <Text>{sessionID}</Text>
                <Text>{JSON.stringify(teams)}</Text>
                <FlatList
					data={results}
					renderItem={({item}) => <Item item={item} navigation={navigation} />}
					keyExtractor={item => item.id}
					contentContainerStyle={{ paddingBottom:150 }} 
				/>
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
		fontSize: SIZES.title,
		color: COLORS.navy,
		textAlign: 'center',
        marginBlock: 30,
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
		color: 'white',
		fontSize: 20,
		fontWeight: 500,
		marginBottom: 10,
	},
	sessionText: {
		color: 'white',
		fontSize: 17,
		lineHeight: 25,
	},
	rightChevron: {
		marginBlock: 'auto',
	},
});
