import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useServices } from '../contexts/ServiceContext';
// import { createTeamInDatabase } from './adminHelpers';
import BasicButton from '../components/BasicButton';
import BackButton from '../components/BackButton';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import { v4 as uuidv4 } from 'uuid';

const SessionDetailsScreen = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const { user, isAuthenticated } = useAuth();
  const { userService } = useServices();
  const { sessionService, teamService } = useServices();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [teams, setTeams] = useState([]);

  // const [modalVisible, setModalVisible] = useState(false);
  const [teamName, setTeamName] = useState("");
  const validateTeams = (teamName) => {
    // Allow letters, numbers, spaces, and between 1-15 characters
    const re = /^[A-Za-z0-9\s]{1,15}$/;
    return re.test(teamName);
  };

  useEffect(() => {
    const fetchSessionTeams = async () => {
      setLoading(true);
      setError(null);
      if (!sessionId) {
        setError("Not a valid session");
        setSessions([]);
        // go back a screen? Error msg set here, though
        return;
      }

      try {
        const teamsList = await sessionService.listSessionTeams(sessionId);
        if (!teamsList) {
          setTeams([]);
          return;
        }
        console.log(sessionId);
        console.log(teamsList);
        setTeams(teamsList);
      } catch (e) {
        console.error("Error fetching teams:", e);
        setError("Failed to load teams.");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionTeams();
  }, [sessionId, teamService]);

  const handleTeamCreation = async () => {
      setError('');
      const teamID = uuidv4();
      // consider session checking before adding team
      // also, consider if create completely empty team (Team N), THEN prompt name
      if (!teamName) {
          // probably not needed, since min is 1 in validateTeams
          setError('Please provide team name');
          return;
      }

      if (!validateTeams(teamName)) {
          setError('Team Name must consist of letters, numbers, spaces, and up to 15 characters long');
          return;
      }

      setLoading(true);

      try {
          // double check teamID
              // note: sessionID should be part of current screen?
          await createTeamInDatabase(teamID, teamName);
          Alert.alert('Success', 'Your team has been created successfully!');
          // navigation.navigate('MySessionsScreen'); 
          // probably just display team now as flat list (between "ADD Teams" and Text Input)

          // TODO: now figure out how to let users join (display on user end!)
      } catch (error) {
          switch (error.code) {
              // only possible error should be duplicates when creating team
              default:
                  setError("Failed to create a new team: " + error.message);
                  break;
          }
      } finally {
          setLoading(false);
      }
  }


  // not needed?
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  /**
   * Creates a team record in the database after valid constraints
   * 
   * @param {string} teamId - unique identifier for team
   * @param {string} teamName - name of team being added
  */
  const createTeamInDatabase = async (teamId, teamName) => {
    try {
        await teamService.createTeam(teamId);
        await teamService.setTeamName(teamId, teamName);
        // now, assign current sessionID to team (should this be done separately?)
        await teamService.setTeamSession(teamId, sessionId);

        // if successful, add team to session
        await sessionService.addTeam(sessionId, teamId);
        console.log(sessionId);
        console.log(teamId);
        console.log(teamName);
        console.log("Team created with unique team ID")
    } catch (error) {
        console.error('Error creating team in database:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.teamName || "Unnamed Team"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>
      <Image style={styles.bee} source={require('../assets/bee.png')} />
      <Text style={styles.title}>Session Details</Text>

      {teams.length === 0 ? (
        <Text style={styles.noTeamsText}>No teams created yet.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        placeholder="Team Name"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        value={teamName}
        onChangeText={setTeamName}
      />

      <BasicButton
        text="Add Team"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={handleTeamCreation}
      />
    </View>
  );
};

export default SessionDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 45,
  },
  backButton: {
    fontSize: 18,
    color: COLORS.darkGray,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.title - 10,
    color: COLORS.navy,
    width: '80%',
    paddingBottom: 30,
    // marginTop: 10,
    // marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: COLORS.darkGray,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 30,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  noTeamsText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  bee: {
    height: 140,
    marginBottom: 10,
    objectFit: 'contain',
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    marginBottom: 10,
    textAlign: 'center',
    width: '80%',
  },
});
