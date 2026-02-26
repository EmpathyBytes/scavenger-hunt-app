import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../components/theme";
import BackButton from "../components/BackButton";
import { auth } from "../firebase_config"; // to get currentUser
import { useServices } from "../contexts/ServiceContext";

const guidelineBaseWidth = 375;

const CreateGameScreen = ({ navigation }) => {
  const { sessionService, artifactService } = useServices();

  const [gameName, setGameName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [selectedArtifacts, setSelectedArtifacts] = useState({});
  const [endTime, setEndTime] = useState(new Date());
  const [errors, setErrors] = useState({ gameName: "", gameCode: "", artifacts: "" });

  const [loadingArtifacts, setLoadingArtifacts] = useState(true);
  const [allArtifacts, setAllArtifacts] = useState([]);

  const { width } = useWindowDimensions();
  const scale = (size) => (width / guidelineBaseWidth) * size;

  const currentUser = auth.currentUser;

  useEffect(() => {
    let mounted = true;
    const loadArtifacts = async () => {
      try {
        setLoadingArtifacts(true);
        const artifacts = await artifactService.getAllArtifacts();
        if (mounted) setAllArtifacts(artifacts || []);
      } catch (e) {
        Alert.alert("Error", "Failed to load artifacts.");
        if (mounted) setAllArtifacts([]);
      } finally {
        if (mounted) setLoadingArtifacts(false);
      }
    };
    loadArtifacts();
    return () => {
      mounted = false;
    };
  }, [artifactService]);

  const artifactsById = useMemo(() => {
    const map = {};
    for (const a of allArtifacts) {
      if (a?.id) map[a.id] = a;
    }
    return map;
  }, [allArtifacts]);

  const toggleArtifact = (id) => {
    setSelectedArtifacts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const adjustTime = (hours) => {
    setEndTime((prev) => {
      const newTime = new Date(prev.getTime() + hours * 60 * 60 * 1000);
      const now = new Date();
      return newTime < now ? now : newTime;
    });
  };

  const checkGameCodeUnique = async (code) => {
    const existing = await sessionService.getSession(code);
    return !existing;
  };

  const validateForm = async () => {
    let valid = true;
    const newErrors = {};

    if (!gameName.trim()) {
      newErrors.gameName = "Game name is required";
      valid = false;
    }

    if (!gameCode.trim()) {
      newErrors.gameCode = "Game code is required";
      valid = false;
    } else if (/\s/.test(gameCode)) {
      newErrors.gameCode = "Game code cannot contain spaces";
      valid = false;
    } else {
      try {
        const isUnique = await checkGameCodeUnique(gameCode);
        if (!isUnique) {
          newErrors.gameCode = "Game code already exists";
          valid = false;
        }
      } catch (e) {
        Alert.alert("Error", "Failed to validate game code. Try again.");
        valid = false;
      }
    }

    const selectedArray = Object.keys(selectedArtifacts).filter((id) => selectedArtifacts[id]);
    if (selectedArray.length === 0) {
      newErrors.artifacts = "Select at least one artifact";
      valid = false;
    }

    setErrors(newErrors);
    return { valid, selectedArray };
  };

  const handleCreateGame = async () => {
    const { valid, selectedArray } = await validateForm();
    if (!valid) return;

    if (!currentUser?.uid) {
      Alert.alert("Error", "You must be logged in to create a game.");
      return;
    }

    const artifactsForGame = {};
    for (const id of selectedArray) {
      const a = artifactsById[id];
      if (!a) continue;
      // Store artifact data under sessions/{code}/artifacts/{artifactId}
      const { id: _id, ...artifactData } = a;
      artifactsForGame[id] = artifactData;
    }

    const now = Date.now();
    const sessionData = {
      sessionName: gameName,
      sessionCode: gameCode,
      creatorId: currentUser.uid,
      createdBy: currentUser.uid,
      gameState: "lobby",
      startTime: now,
      endTime: endTime.getTime(),
      participants: {},
      artifacts: artifactsForGame,
    };

    try {
      await sessionService.createSession(gameCode, sessionData);
      navigation.navigate("GamePreviewScreen", { sessionId: gameCode });
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to create game.");
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { padding: scale(20) }]}>
      <Text style={[styles.title, { fontSize: scale(SIZES.title), marginTop: scale(70) }]}>
        Create New Game
      </Text>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>
        Game Name
      </Text>
      <TextInput
        style={[styles.input, { padding: scale(12) }]}
        placeholder="Enter game name"
        value={gameName}
        onChangeText={setGameName}
      />
      {errors.gameName ? <Text style={{ color: "red" }}>{errors.gameName}</Text> : null}

      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>
        Game Code (no spaces)
      </Text>
      <TextInput
        style={[styles.input, { padding: scale(12) }]}
        placeholder="Enter unique game code"
        value={gameCode}
        onChangeText={setGameCode}
        autoCapitalize="characters"
      />
      {errors.gameCode ? <Text style={{ color: "red" }}>{errors.gameCode}</Text> : null}

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>
        Game End Time
      </Text>

      <View style={[styles.timeBox, { padding: scale(15), borderRadius: 12, borderWidth: 1, borderColor: COLORS.beige }]}>
        <Text style={[styles.timeText, { fontSize: scale(SIZES.body), marginBottom: scale(15) }]}>
          {endTime.toLocaleDateString()}{" "}
          {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <TouchableOpacity style={styles.timeButton} onPress={() => adjustTime(-1)}>
              <Text style={styles.timeButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.timeButtonLabel}>1hr</Text>
          </View>

          <View style={{ alignItems: "center", gap: 6 }}>
            <TouchableOpacity style={styles.timeButton} onPress={() => adjustTime(1)}>
              <Text style={styles.timeButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.timeButtonLabel}>1hr</Text>
          </View>

          <View style={{ alignItems: "center", gap: 6 }}>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: "#F5A623" }]}
              onPress={() => adjustTime(3)}
            >
              <Text style={styles.timeButtonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.timeButtonLabel}>3hrs</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>
        Select Artifacts
      </Text>

      {loadingArtifacts ? (
        <ActivityIndicator size="large" color={COLORS.navy} style={{ marginTop: 10 }} />
      ) : (
        allArtifacts.map((artifact) => (
          <View key={artifact.id} style={[styles.artifactRow, { marginTop: scale(15) }]}>
            <TouchableOpacity
              style={[styles.checkbox, { width: scale(22), height: scale(22), marginRight: scale(10) }]}
              onPress={() => toggleArtifact(artifact.id)}
            >
              {selectedArtifacts[artifact.id] ? (
                <View style={{ width: scale(14), height: scale(14), backgroundColor: COLORS.gold }} />
              ) : null}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: scale(14) }}>{artifact.name}</Text>
              <Text style={{ fontSize: scale(12), color: "#666" }}>
                {artifact.locationHint || ""}
              </Text>
            </View>
          </View>
        ))
      )}

      {errors.artifacts ? <Text style={{ color: "red", marginTop: 5 }}>{errors.artifacts}</Text> : null}

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: scale(30) }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#999",
            borderRadius: scale(12),
            paddingVertical: scale(12),
            alignItems: "center",
            marginRight: scale(10),
          }}
          onPress={() => navigation.navigate("ViewGamesScreen")}
        >
          <Text style={{ color: "white", fontFamily: "Figtree_400Regular", fontSize: SIZES.body }}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#0B3D91",
            borderRadius: scale(12),
            paddingVertical: scale(12),
            alignItems: "center",
          }}
          onPress={handleCreateGame}
        >
          <Text style={{ color: "white", fontFamily: "Figtree_400Regular", fontSize: SIZES.body }}>
            Create Game
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateGameScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.beige,
  },
  title: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.title,
    color: COLORS.navy,
    textAlign: "center",
  },
  label: {
    fontSize: SIZES.body,
    fontFamily: "Figtree_600SemiBold",
    fontWeight: "600",
    color: COLORS.navy,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.beige,
    fontFamily: "Figtree_400Regular",
  },
  timeBox: {
    backgroundColor: "white",
    borderColor: "#ccc",
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  artifactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  timeButton: {
    width: 30,
    height: 30,
    borderRadius: 26,
    backgroundColor: COLORS.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  timeButtonText: {
    color: "white",
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
  timeButtonLabel: {
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    fontFamily: "Figtree_400Regular",
  },
});

