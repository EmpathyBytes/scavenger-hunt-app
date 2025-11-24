import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../../components/theme";
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  useFonts,
} from "@expo-google-fonts/figtree";
import BackButton from "../../components/BackButton";
import { useServices } from "../../contexts/ServiceContext";

const Item = ({ item, rank }) => {
  const color =
    rank === 1
      ? "#EEB210"
      : rank === 2
      ? "#D6DBD4"
      : rank === 3
      ? "#AB7325"
      : "white";
  return (
    <View style={[{ backgroundColor: color }, styles.team]}>
      <Text style={styles.teamTitle}>
        {rank}. {item.displayName}
      </Text>
      <Text style={styles.teamText}>Score: {item.points}</Text>
    </View>
  );
};

const LeaderboardScreen = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const { sessionService } = useServices();
  const { sessionID } = route.params;

  const [entries, setEntries] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await sessionService.getSession(sessionID);
        if (session) {
          setSessionName(session.sessionName || "Session");
        }
        const leaderboard = await sessionService.getSessionLeaderboardEntries(sessionID);
        setEntries(leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionID, sessionService]);

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right"]}>
        <View style={styles.container}>
          <BackButton
            backgroundColor={COLORS.beige}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.navy} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right"]}>
      <View style={styles.container}>
        <BackButton
          backgroundColor={COLORS.beige}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>{sessionName}</Text>
        <FlatList
          data={entries}
          renderItem={({ item, index }) => (
            <Item item={item} rank={index + 1} />
          )}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingBottom: 150 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default LeaderboardScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    fontFamily: "Figtree_600SemiBold",
    backgroundColor: COLORS.beige,
  },
  title: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.title,
    color: COLORS.navy,
    textAlign: "center",
    marginBlock: 30,
  },
  container: {
    gap: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontFamily: "Figtree_600SemiBold",
    fontWeight: 500,
    marginBottom: 10,
    textAlign: "center",
  },
  teamText: {
    fontFamily: "Figtree_400Regular",
    color: COLORS.navy,
    fontSize: 18,
    textAlign: "center",
  },
});