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
import BackButton from '../components/BackButton';
import { auth } from '../firebase_config'; // to get currentUser
import BasicButton from "../components/BasicButton";
import { database } from "../firebase_config";
import { ref, get, set } from "firebase/database";
import { DATABASE_CONFIG } from "../config/config";

const guidelineBaseWidth = 375;

const CreateGameScreen = ({ navigation }) => {
  const [gameName, setGameName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [selectedArtifacts, setSelectedArtifacts] = useState({});
  const [endTime, setEndTime] = useState(new Date());
  const [errors, setErrors] = useState({ gameName: "", gameCode: "", artifacts: "" });
  const [artifactOptions, setArtifactOptions] = useState([]);
  const [artifactsLoading, setArtifactsLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const { width } = useWindowDimensions();
  const scale = size => (width / guidelineBaseWidth) * size;

  const currentUser = auth.currentUser;

  const baseNode = DATABASE_CONFIG.baseNode;

  const artifacts = useMemo(() => artifactOptions, [artifactOptions]);

  const normalizeCode = (code) => (code || "").trim();

  const buildArtifactOptions = (value) => {
    if (!value || typeof value !== "object") return [];

    const options = Object.entries(value).map(([id, data]) => {
      const name = data?.name ?? id;
      const hint = data?.locationHint ?? data?.hint ?? "";
      return { id, name, hint, raw: data ?? {} };
    });

    options.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return options;
  };

  const fetchNodeValue = async (path) => {
    const snapshot = await get(ref(database, path));
    return snapshot.exists() ? snapshot.val() : null;
  };

  const fetchArtifactOptions = async () => {
    const catalog = await fetchNodeValue(`${baseNode}/ArtifactCatalog`);
    const fromCatalog = buildArtifactOptions(catalog);
    if (fromCatalog.length > 0) return fromCatalog;

    const artifacts = await fetchNodeValue(`${baseNode}/artifacts`);
    return buildArtifactOptions(artifacts);
  };

  const buildArtifactsMapForSession = (selectedIds, allOptions) => {
    const selectedSet = new Set(selectedIds);
    const selected = allOptions.filter((a) => selectedSet.has(a.id));

    const map = {};
    for (const a of selected) {
      const safeRaw = a.raw && typeof a.raw === "object" ? a.raw : {};
      map[a.id] = {
        ...safeRaw,
        name: a.name ?? a.id,
        hint: a.hint ?? "",
      };
    }
    return map;
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setArtifactsLoading(true);
      try {
        const options = await fetchArtifactOptions();
        if (isMounted) setArtifactOptions(options);
      } catch (e) {
        console.error("Failed to load artifacts:", e);
        if (isMounted) setArtifactOptions([]);
      } finally {
        if (isMounted) setArtifactsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [baseNode]);

  const toggleArtifact = (id) => {
    setSelectedArtifacts(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const adjustTime = (hours) => {
    setEndTime(prev => {
      const newTime = new Date(prev.getTime() + hours * 60 * 60 * 1000);
      const now = new Date();
      return newTime < now ? now : newTime;
    });
  };

  // -----------------------
  const checkGameCodeUnique = async (code) => {
    const normalized = normalizeCode(code);
    if (!normalized) return false;
    const snapshot = await get(ref(database, `${baseNode}/sessions/${normalized}`));
    return !snapshot.exists();
  };

  const validateForm = async () => {
    let valid = true;
    let newErrors = {};

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
      // Async uniqueness check
      const isUnique = await checkGameCodeUnique(gameCode);
      if (!isUnique) {
        newErrors.gameCode = "Game code already exists";
        valid = false;
      }
    }

    const selectedArray = Object.keys(selectedArtifacts).filter(id => selectedArtifacts[id]);
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

    const normalizedCode = normalizeCode(gameCode);
    const artifactsMap = buildArtifactsMapForSession(selectedArray, artifactOptions);

    const sessionData = {
      sessionName: gameName.trim(),
      sessionCode: normalizedCode,
      createdBy: currentUser ? currentUser.uid : "unknown",
      gameState: "LOBBY",
      startTime: new Date().toISOString(),
      endTime: endTime.toISOString(),
      participants: {},
      artifacts: artifactsMap,
    };

    setCreating(true);
    try {
      await set(ref(database, `${baseNode}/sessions/${normalizedCode}`), sessionData);
      navigation.navigate("GamePreviewScreen", {
        sessionCode: normalizedCode,
        session: sessionData,
      });
      Alert.alert("Success", "Game created in Firebase.");
    } catch (e) {
      console.error("Failed to create session:", e);
      Alert.alert("Error", e?.message || "Failed to create game. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { padding: scale(20) }]}>
      <Text style={[styles.title, { fontSize: scale(SIZES.title), marginTop: scale(70) }]}>Create New Game</Text>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>Game Name</Text>
      <TextInput
        style={[styles.input, { padding: scale(12) }]}
        placeholder="Enter game name"
        value={gameName}
        onChangeText={setGameName}
      />
      {errors.gameName && <Text style={{ color: 'red' }}>{errors.gameName}</Text>}

      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>Game Code (no spaces)</Text>
      <TextInput
        style={[styles.input, { padding: scale(12) }]}
        placeholder="Enter unique game code"
        value={gameCode}
        onChangeText={setGameCode}
      />
      {errors.gameCode && <Text style={{ color: 'red' }}>{errors.gameCode}</Text>}

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>Game End Time</Text>

    <View style={[styles.timeBox, { padding: scale(15), borderRadius: 12, borderWidth: 1, borderColor: COLORS.beige }]}>
    {/* Time Display */}
    <Text style={[styles.timeText, { fontSize: scale(SIZES.body), marginBottom: scale(15) }]}>
    {endTime.toLocaleDateString()} {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <TouchableOpacity style={[styles.timeButton, { backgroundColor: "#F5A623" }]} onPress={() => adjustTime(3)}>
            <Text style={styles.timeButtonText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.timeButtonLabel}>3hrs</Text>
        </View>
    </View>
    </View>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>Select Artifacts</Text>
      {artifactsLoading ? (
        <View style={{ marginTop: scale(15), alignItems: "center" }}>
          <ActivityIndicator color={COLORS.navy} />
          <Text style={{ marginTop: 8, color: COLORS.navy, fontFamily: 'Figtree_400Regular' }}>
            Loading artifacts…
          </Text>
        </View>
      ) : artifacts.length === 0 ? (
        <Text style={{ marginTop: scale(10), color: "#666", fontFamily: 'Figtree_400Regular' }}>
          No artifacts found in Firebase.
        </Text>
      ) : (
        artifacts.map((artifact) => (
          <TouchableOpacity
            key={artifact.id}
            style={[styles.artifactRow, { marginTop: scale(15) }]}
            onPress={() => toggleArtifact(artifact.id)}
          >
            <View style={[styles.checkbox, { width: scale(22), height: scale(22), marginRight: scale(10) }]}>
              {selectedArtifacts[artifact.id] && <View style={{ width: scale(14), height: scale(14), backgroundColor: COLORS.gold }} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: scale(14) }}>{artifact.name}</Text>
              {!!artifact.hint && <Text style={{ fontSize: scale(12), color: "#666" }}>{artifact.hint}</Text>}
            </View>
          </TouchableOpacity>
        ))
      )}
      {errors.artifacts && <Text style={{ color: 'red', marginTop: 5 }}>{errors.artifacts}</Text>}

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
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "white", fontFamily: 'Figtree_400Regular', fontSize: SIZES.body }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#0B3D91",
            borderRadius: scale(12),
            paddingVertical: scale(12),
            alignItems: "center",
          }}
          onPress={creating ? undefined : handleCreateGame}
          disabled={creating}
        >
          <Text style={{ color: "white", fontFamily: 'Figtree_400Regular', fontSize: SIZES.body }}>
            {creating ? "Creating…" : "Create Game"}
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
  fontFamily: 'Figtree_600SemiBold',
  fontSize: SIZES.title,
  color: COLORS.navy,
  textAlign: 'center',
  },
  label: {
    fontSize: SIZES.body,
    fontFamily: 'Figtree_600SemiBold',
    fontWeight: "600",
    color: COLORS.navy,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.beige,
    fontFamily: 'Figtree_400Regular',
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
  checked: {
    width: 14,
    height: 14,
    backgroundColor: "#FFD700", // gold
  },
  artifactName: {
    fontWeight: "600",
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  artifactHint: {
    fontSize: 12,
    color: "#666",
    fontFamily: 'Figtree_400Regular',
  },
  createButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    alignItems: "center",
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  cancelButton: {
    backgroundColor: "#999",
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
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
    fontFamily: 'Figtree_400Regular',
},
});