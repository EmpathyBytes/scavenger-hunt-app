import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../components/theme";
import BackButton from "../components/BackButton";
import { auth } from "../firebase_config";
import { useServices } from "../contexts/ServiceContext";

const ViewGamesScreen = ({ navigation }) => {
  const { sessionService } = useServices();
  const currentUser = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  const mySessions = useMemo(() => {
    if (!currentUser?.uid) return [];
    return sessions
      .filter((s) => s && (s.creatorId === currentUser.uid || s.createdBy === currentUser.uid))
      .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
  }, [sessions, currentUser?.uid]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const all = await sessionService.listSessions();
        if (mounted) setSessions(all || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [sessionService]);

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      <Text style={styles.title}>Host Games</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("CreateGameScreen")}
      >
        <Text style={styles.primaryButtonText}>Create Game</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Games</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.navy} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {mySessions.length === 0 ? (
            <Text style={styles.emptyText}>No games yet. Create one!</Text>
          ) : (
            mySessions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("GamePreviewScreen", { sessionId: s.id })
                }
              >
                <Text style={styles.cardTitle}>{s.sessionName || "Untitled Game"}</Text>
                <Text style={styles.cardSub}>
                  Code: {s.sessionCode || s.id}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ViewGamesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    padding: 20,
    paddingTop: 90,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  title: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.title,
    color: COLORS.navy,
    textAlign: "center",
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "white",
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body,
  },
  sectionTitle: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body,
    color: COLORS.navy,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.beige,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body,
    color: COLORS.navy,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body_small,
    color: "#666",
  },
});

