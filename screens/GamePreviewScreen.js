import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { COLORS, SIZES } from "../components/theme";
import BackButton from "../components/BackButton";
import { useServices } from "../contexts/ServiceContext";

const GamePreviewScreen = ({ navigation, route }) => {
  const { sessionService } = useServices();
  const { sessionId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const artifactsList = useMemo(() => {
    const artifacts = session?.artifacts;
    if (!artifacts || typeof artifacts !== "object") return [];
    return Object.entries(artifacts).map(([id, data]) => ({ id, ...(data || {}) }));
  }, [session]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const s = await sessionService.getSession(sessionId);
        if (mounted) setSession(s);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (sessionId) load();
    return () => {
      mounted = false;
    };
  }, [sessionId, sessionService]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      <Text style={styles.title}>Game Preview</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.navy} />
      ) : !session ? (
        <Text style={styles.body}>Session not found.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{session.sessionName || "Untitled Game"}</Text>
          <Text style={styles.body}>Code: {session.sessionCode || sessionId}</Text>
          <Text style={styles.body}>
            Ends:{" "}
            {session.endTime
              ? new Date(session.endTime).toLocaleString()
              : "Not set"}
          </Text>
          <Text style={[styles.body, { marginTop: 10 }]}>
            Artifacts: {artifactsList.length}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default GamePreviewScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.beige,
  },
  cardTitle: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.heading,
    color: COLORS.navy,
    marginBottom: 8,
  },
  body: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body,
    color: COLORS.navy,
  },
});

