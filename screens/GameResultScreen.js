import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { COLORS, SIZES } from "../components/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  useFonts,
  Figtree_400Regular,
  Figtree_600SemiBold,
} from "@expo-google-fonts/figtree";
import BackButton from '../components/BackButton';
import BasicButton from "../components/BasicButton";

// replace with real data!
const dummyParticipants = [
  { uid: "u1", displayName: "Alice", points: 120, artifacts: 3 },
  { uid: "u2", displayName: "Bob", points: 150, artifacts: 5 },
  { uid: "u3", displayName: "Charlie", points: 90, artifacts: 2 },
  { uid: "u4", displayName: "Dana", points: 130, artifacts: 4 },
];

const PLACE_LABELS = ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"];
const MEDAL_EMOJIS = { 1: "🥇", 2: "🥈", 3: "🥉" };

const GameResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, gameName = "Tech Trek" } = route.params ?? {}; // replace with real game name!
  const { width } = useWindowDimensions();
  const scale = (size) => (width / 375) * size;

  const [participants, setParticipants] = useState([]);

  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  useEffect(() => {
    const fetched = [...dummyParticipants];
    fetched.sort((a, b) => b.points - a.points);
    setParticipants(fetched);
  }, [sessionId]);

  if (!fontsLoaded) return null;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: scale(20), paddingBottom: scale(40) },
      ]}>

      <View style={styles.backButtonContainer}>
          <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      <Text style={{ fontSize: scale(72), marginTop: scale(70), lineHeight: scale(100) }}>
        🏆
      </Text>

      <Text style={[styles.title, { fontSize: scale(SIZES.title), marginTop: scale(2) }]}>
        Game Results
      </Text>

      <Text style={[styles.subtitle, { fontSize: scale(16), marginTop: scale(4), marginBottom: scale(28) }]}>
        {gameName}
      </Text>

      <FlatList
        data={participants.slice(0, 3)}
        keyExtractor={(item) => item.uid}
        scrollEnabled={false}
        style={{ width: "100%" }}
        renderItem={({ item, index }) => {
          const rank = index + 1;
          return (
            <View style={[styles.card, { marginBottom: scale(12) }]}>
              <Text style={{ fontSize: scale(36), width: scale(48) }}>
                {MEDAL_EMOJIS[rank]}
              </Text>
              <View style={{ flex: 1, marginLeft: scale(10) }}>
                <Text style={[styles.placeLabel, { fontSize: scale(13) }]}>
                  {PLACE_LABELS[index] ?? `${rank}th Place`}
                </Text>
                <Text style={[styles.name, { fontSize: scale(17) }]}>
                  {item.displayName}
                </Text>
                <Text style={[styles.meta, { fontSize: scale(13) }]}>
                  {item.points} points • {item.artifacts} artifacts
                </Text>
              </View>
            </View>
          );
        }}
      />

      <BasicButton
        text="Back to Games"
        style={{ marginTop: scale(16), width: "100%" }}
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate("JoinSessionScreen")}
      />
    </ScrollView>
  );
};

export default GameResultsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.beige,
    alignItems: "center",
  },
  title: {
    fontFamily: "Figtree_600SemiBold",
    color: COLORS.navy,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: "Figtree_600SemiBold",
    color: "#E5A100",
    textAlign: "center",
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  placeLabel: {
    fontFamily: "Figtree_600SemiBold",
    color: COLORS.navy,
    marginBottom: 1,
  },
  name: {
    fontFamily: "Figtree_600SemiBold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  meta: {
    fontFamily: "Figtree_400Regular",
    color: "#888",
  },
});