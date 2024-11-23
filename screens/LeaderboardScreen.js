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

const Item = ({ item }) => {
    const color = item.rank == 1 ? '#EEB210' : item.rank == 2 ? '#D6DBD4' : item.rank == 3 ? '#AB7325' : 'white';
    return (
	<View style={[{backgroundColor: color}, styles.team]}>
		<View>
			<Text style={styles.teamTitle}>
				{item.rank} {item.name}
			</Text>
			<Text style={styles.teamText}>
				{"Score: " + item.score}
			</Text>
		</View>
	</View>
    )};

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
                                   .map((item, index) => ({
                                        ...item,
                                        rank: index + 1,
                                    }));

	return (
		<SafeAreaView style={styles.screen} edges={['left', 'right']}>
			<View style={styles.container}>
				<BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.goBack()} />
                <Text style={styles.title}>{sessionData.name}</Text>
                <FlatList
					data={teams}
					renderItem={({item}) => <Item item={item} />}
					keyExtractor={item => item.name}
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
	team: {
		borderRadius: 15,
		padding: 20,
		marginBlock: 10,
		marginHorizontal: 35,
	},
	teamTitle: {
		color: COLORS.navy,
		fontSize: 25,
        fontFamily: 'Figtree_600SemiBold',
		fontWeight: 500,
        marginBottom: 10,
        textAlign: 'center',
	},
	teamText: {
        fontFamily: 'Figtree_400Regular',
		color: COLORS.navy,
		fontSize: 18,
        textAlign: 'center',
	},
});
