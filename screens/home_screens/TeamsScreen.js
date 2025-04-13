import React from 'react'
import { Text, View, StyleSheet, Dimensions, Image, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalSession, currentTeam } from '../JoinSessionScreen'
const { width, height } = Dimensions.get('window');


const teams = require('../../data/teams.json');
const users = require('../../data/users.json');

/* Swapping this out for team.json
const members = [
  {
    id: 1,
    name: "User 1",
    score: "200"
  },
  {
    id: 2,
    name: "User 2",
    score: "200"
  },
  {
    id: 3,
    name: "User 3",
    score: "200"
  },
  {
    id: 4,
    name: "User 4",
    score: "200"
  }
];
*/

let yourTeam = {};
let teamsPlacement = {};


const getPoints = () => {
  users.forEach(user => {
    if ("currentSession" in user) {
      if (user.currentSession === globalSession) {
        let userSession = user.currentSession;
        if (user.sessionsJoined[userSession] && user.sessionsJoined[userSession].teamId === currentTeam) {
          yourTeam[user.username] = user.sessionsJoined[userSession].points;
        }
      }
    }
  });
}


const getTeamsPlacement = () => {
  users.forEach(user => {
    if ("currentSession" in user) {
      if (user.currentSession === globalSession) {
        let userSession = user.currentSession;
        if (user.sessionsJoined[userSession]) {
          let currentTeamId = user.sessionsJoined[userSession].teamId;
          if (currentTeamId in teamsPlacement) {
            teamsPlacement[currentTeamId] += user.sessionsJoined[userSession].points;
            console.log("Already a team: " + teamsPlacement[currentTeamId] + " " + user.sessionsJoined[userSession].points);
          }
          else {
            teamsPlacement[currentTeamId] = user.sessionsJoined[userSession].points;
            console.log("New team:" + teamsPlacement[currentTeamId] + " " + user.sessionsJoined[userSession].points);

          }
        }
      }
    }
  });
}

getPoints();
getTeamsPlacement();

// not sure why this was Artifacts Screen (was probably just copy/pasted)?
const TeamsScreen = () => {
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Object.entries vs Object.values. This is the same as above but only keeps the values
  let sortedMembers = Object.entries(yourTeam).sort((a, b) => b[1] - a[1]);

  let sortedTeams = Object.entries(teamsPlacement).sort((a, b) => b[1] - a[1]);
  console.log(sortedTeams);

  const topTeams = sortedTeams.slice(0, 3);
                // a little worried about the paddingTop...
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View style={styles.podiumContainter}>
        <View style={styles.podiumRectangle}>
        <View style={styles.textContainer}>
          <Text style={styles.topTeamsText}>{topTeams[1] ? `${topTeams[1][0]}` : '---'}</Text>
        </View>
        <View style={styles.pointContainer}>
          <Text style={styles.scoreText}>{topTeams[1] ? topTeams[1][1] : '---'}</Text>
        </View>
          <View style={[styles.rectangle, { height: height * 0.17, backgroundColor: '#FFCD47' }]}>
            <Image style={styles.silverImage} source={require('../../assets/silver-medal.png')} />
          </View>
        </View>
        <View style={styles.podiumRectangle}>
        <View style={styles.textContainer}>
          <Text style={styles.topTeamsText}>{topTeams[0] ? `${topTeams[0][0]}` : '---'}</Text>
        </View> 
        <View style={styles.pointContainer}>
          <Text style={styles.scoreText}>{topTeams[0] ? topTeams[0][1] : '---'}</Text>
        </View>
          <View style={[styles.rectangle, { height: height * 0.22, backgroundColor: '#EEB210' }]}>
            <Image style={styles.goldImage} source={require('../../assets/gold-medal.png')} />
          </View>
        </View>
        <View style={styles.podiumRectangle}>
        <View style={styles.textContainer}>
          <Text style={styles.topTeamsText}>{topTeams[2] ? `${topTeams[2][0]}` : '---'}</Text>
        </View>
        <View style={styles.pointContainer}>
          <Text style={styles.scoreText}>{topTeams[2] ? topTeams[2][1] : '---'}</Text>
        </View>
          <View style={[styles.rectangle, { height: height * 0.12, backgroundColor: '#FFCD47' }]}>
            <Image style={styles.bronzeImage} source={require('../../assets/bronze-medal.png')} />
          </View>
        </View>
      </View>
      <SafeAreaView style={styles.teamContainer}>
        <Text style={styles.yourTeamText}>Your Team</Text>
        <FlatList
          data={sortedMembers}
          renderItem={({item}) => <View style={styles.spaceBetween}><Text>{item[0]}</Text><Text>{item[1]}</Text></View>}  // % changed team -> teamName
          keyExtractor={item => item[0]} // % changed team -> teamName
        />
      </SafeAreaView>

      <Text style={styles.teamsText}>Teams</Text>
    </View>
  )
}

// I do not know how to make the shadow only appear on the bottom
// it also seems that the text is in the podium container so the text also 
// gets a shadow
const styles = StyleSheet.create({
  podiumContainter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 6,
    marginTop: 40,
  },
  rectangle: {
    width: '100%', // width * 0.20 then center images later
    position: 'relative',
  },
  podiumRectangle: {
    position: 'relative',
    width: '24%',
    alignItems: 'center',
  },
  goldImage: {
    zIndex: 2,
    alignSelf: 'center',
  },
  silverImage: {
    resizeMode: 'contain',
    alignSelf: 'center',
    zIndex: 2
  },
  bronzeImage: {
    zIndex: 2,
    alignSelf: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: 240,
    marginTop: 10
  },
  textContainer: {
    position: 'absolute',
    top: -45, // Distance from top of screen
    left: 0,
    right: 0,
    flexDirection: 'row', // ← THIS makes the Texts go left to right!
    justifyContent: 'center', // Even spacing
    zIndex: 10,
  },
  pointContainer: {
    position: 'absolute',
    top: 46, // Distance from top of screen
    left: 0,
    right: 0,
    flexDirection: 'row', // ← THIS makes the Texts go left to right!
    justifyContent: 'center', // Even spacing
    zIndex: 10,
  },
  topTeamsText: {
    fontSize: 18,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
  },
  yourTeamText: {
    fontSize: 20,
  },
  // placement: {
  //   padding: 5,
  //   backgroundColor: 'black',
  // }
  teamContainer: {
    height: '50%',
  },
  teamsText: {
    position: 'absolute',
    bottom: 30,
    fontSize: 30,
  },
})
export default TeamsScreen