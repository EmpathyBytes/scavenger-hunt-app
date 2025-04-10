import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useServices } from "../contexts/ServiceContext";
import { COLORS } from "../components/theme";

const MySessionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { sessionService } = useServices();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user?.uid) {
          setError("User not authenticated.");
          setSessions([]);
          return;
        }

        const sessionsData = await sessionService.getData("sessions");

        if (!sessionsData) {
          setSessions([]);
          return;
        }

        const sessionsList = Object.entries(sessionsData)
          .filter(([sessionId, session]) => session.creatorId === user.uid)
          .map(([sessionId, session]) => ({
            id: sessionId,
            ...session,
          }));

        setSessions(sessionsList);
      } catch (e) {
        console.error("Error fetching sessions:", e);
        setError("Failed to load sessions.");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSessions();
  }, [user?.uid, sessionService]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionItem}
      onPress={() => {
        navigation.navigate("SessionDetailsScreen", { sessionId: item.id });
      }}
    >
      <Text style={styles.sessionName}>{item.sessionName || "Unnamed Session"}</Text>
      <Text style={styles.sessionDetails}>
        {`Start: ${item.startTime}, End: ${item.endTime}, Active: ${item.isActive ? 'Yes' : 'No'}`}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.navy} />
        <Text>Loading Sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sessions</Text>
      {sessions.length === 0 ? (
        <Text style={styles.noSessionsText}>No sessions created yet.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.beige,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.navy,
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  sessionItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.navy,
  },
  sessionDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  noSessionsText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default MySessionsScreen;