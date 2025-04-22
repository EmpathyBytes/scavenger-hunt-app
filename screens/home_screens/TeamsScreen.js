import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import { useAuth } from '../../contexts/AuthContext';
import { useServices } from '../../contexts/ServiceContext';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const TeamsScreen = () => {
  const { user } = useAuth();
  const { userService, teamService, sessionService, artifactService } = useServices();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [membersData, setMembersData] = useState({});
  const [artifactsFoundByTeam, setArtifactsFoundByTeam] = useState({});
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [leavingTeam, setLeavingTeam] = useState(false);
  const [artifactNames, setArtifactNames] = useState({});

  // Load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;
      
      // Get user data
      const userData = await userService.getUser(user.uid);
      setUserData(userData);
      
      if (!userData?.currentSession) {
        setLoading(false);
        return;
      }
      
      // Get session data
      const sessionData = await sessionService.getSession(userData.currentSession);
      setSessionData(sessionData);
      
      if (!sessionData) {
        setLoading(false);
        return;
      }
      
      // Get teams for this session
      const teamIds = await sessionService.listSessionTeams(userData.currentSession);
      
      // Fetch each team's details
      const teamsData = [];
      const teamsMembers = {};
      const teamArtifacts = {};
      
      for (const teamId of teamIds) {
        const team = await teamService.getTeam(teamId);
        if (team) {
          teamsData.push({ id: teamId, ...team });
          
          // Get team members
          const memberIds = await teamService.listTeamMembers(teamId);
          const members = [];
          
          // For each member, get their data to display email
          for (const memberId of memberIds) {
            const member = await userService.getUser(memberId);
            if (member) {
              members.push({
                id: memberId,
                email: member.email,
                displayName: member.displayName
              });
              
              // Add artifacts found by this member to the team's artifact list
              if (member.sessionsJoined?.[userData.currentSession]?.foundArtifacts) {
                const foundArtifacts = Object.keys(member.sessionsJoined[userData.currentSession].foundArtifacts);
                
                if (!teamArtifacts[teamId]) {
                  teamArtifacts[teamId] = new Set();
                }
                
                foundArtifacts.forEach(artifact => teamArtifacts[teamId].add(artifact));
              }
            }
          }
          
          teamsMembers[teamId] = members;
        }
      }
      
      // Convert Sets to Arrays for rendering
      const artifactsFound = {};
      const artifactNamesMap = {};
      
      for (const teamId of Object.keys(teamArtifacts)) {
        artifactsFound[teamId] = Array.from(teamArtifacts[teamId]);
        
        // Fetch artifact names for each team's artifacts
        for (const artifactId of artifactsFound[teamId]) {
          if (!artifactNamesMap[artifactId]) {
            try {
              const artifact = await artifactService.getArtifact(artifactId);
              artifactNamesMap[artifactId] = artifact?.name || artifactId;
            } catch (error) {
              console.error(`Error fetching artifact ${artifactId}:`, error);
              artifactNamesMap[artifactId] = artifactId; // Fallback to ID if error
            }
          }
        }
      }
      
      setTeams(teamsData);
      setMembersData(teamsMembers);
      setArtifactsFoundByTeam(artifactsFound);
      setArtifactNames(artifactNamesMap);
      
    } catch (error) {
      console.error("Error fetching teams data:", error);
      Alert.alert("Error", "Failed to load teams data");
    } finally {
      setLoading(false);
    }
  };

  // Join a team
  const handleJoinTeam = async (teamId) => {
    if (joiningTeam) return;
    
    try {
      setJoiningTeam(true);
      await userService.assignUserToTeam(user.uid, userData.currentSession, teamId);
      Alert.alert("Success", "You have joined the team successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error joining team:", error);
      Alert.alert("Error", error.message || "Failed to join team");
    } finally {
      setJoiningTeam(false);
    }
  };

  // Leave current team
  const handleLeaveTeam = async () => {
    if (leavingTeam) return;
    
    // Get user's current team
    const sessionInfo = userData.sessionsJoined[userData.currentSession];
    if (!sessionInfo?.teamId) {
      Alert.alert("Error", "You are not part of any team");
      return;
    }
    
    try {
      setLeavingTeam(true);
      await userService.removeUserFromTeam(user.uid, userData.currentSession);
      Alert.alert("Success", "You have left the team successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error leaving team:", error);
      Alert.alert("Error", error.message || "Failed to leave team");
    } finally {
      setLeavingTeam(false);
    }
  };

  // Check if user is in a specific team
  const isUserInTeam = (teamId) => {
    if (!userData?.sessionsJoined?.[userData.currentSession]?.teamId) return false;
    return userData.sessionsJoined[userData.currentSession].teamId === teamId;
  };
  
  // Check if user is in any team
  const isUserInAnyTeam = () => {
    if (!userData?.sessionsJoined?.[userData.currentSession]?.teamId) return false;
    return true;
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  if (!userData?.currentSession) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          You are not currently in any session.
        </Text>
      </View>
    );
  }

  if (teams.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          No teams found in the current session.
        </Text>
      </View>
    );
  }

  return (
    <BottomSheetScrollView style={styles.container}>
      <Text style={styles.title}>Teams</Text>
      
      {teams.map(team => (
        <View key={team.id} style={styles.teamContainer}>
          <Text style={styles.teamName}>{team.teamName || "Unnamed Team"}</Text>
          
          {/* Team Members */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Members:</Text>
            {membersData[team.id]?.length > 0 ? (
              membersData[team.id].map(member => (
                <View key={member.id} style={styles.memberItem}>
                  <Text style={styles.memberText}>
                    {member.displayName || member.email}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No members</Text>
            )}
          </View>
          
          {/* Team Artifacts */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Artifacts Found:</Text>
            {artifactsFoundByTeam[team.id]?.length > 0 ? (
              artifactsFoundByTeam[team.id].map(artifactId => (
                <View key={artifactId} style={styles.artifactItem}>
                  <Text style={styles.artifactText}>
                    {artifactNames[artifactId] || artifactId}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No artifacts found yet</Text>
            )}
          </View>
          
          {/* Join/Leave Button */}
          {isUserInTeam(team.id) ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeaveTeam}
              disabled={leavingTeam}
            >
              <Text style={styles.buttonText}>
                {leavingTeam ? "Leaving..." : "Leave Team"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                isUserInAnyTeam() ? styles.disabledButton : styles.joinButton
              ]}
              onPress={() => handleJoinTeam(team.id)}
              disabled={isUserInAnyTeam() || joiningTeam}
            >
              <Text style={styles.buttonText}>
                {joiningTeam ? "Joining..." : "Join Team"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.beige,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.beige,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.beige,
  },
  messageText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
    color: COLORS.navy,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.heading,
    color: COLORS.navy,
    marginBottom: 20,
    textAlign: 'center',
  },
  teamContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // width: '100%',
  },
  teamName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body_large,
    color: COLORS.navy,
    marginBottom: 10,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body,
    color: COLORS.navy,
    marginBottom: 6,
  },
  memberItem: {
    paddingVertical: 4,
  },
  memberText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  artifactItem: {
    paddingVertical: 4,
  },
  artifactText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  emptyText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  actionButton: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: COLORS.navy,
  },
  leaveButton: {
    backgroundColor: '#D32F2F', // Red color for leave
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body_small,
    color: 'white',
  },
});

export default TeamsScreen;