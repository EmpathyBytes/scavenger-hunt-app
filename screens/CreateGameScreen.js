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
import { COLORS, SIZES, SPACING } from "../components/theme";
import BackButton from '../components/BackButton';
import BasicButton from "../components/BasicButton";
import Input from "../components/Input";
import { database } from "../firebase_config";
import { ref, get, set } from "firebase/database";
import { DATABASE_CONFIG } from "../config/config";
import { useAuth } from '../contexts/AuthContext';

const guidelineBaseWidth = 375;

const CreateGameScreen = ({ navigation }) => {
  const [gameName, setGameName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [selectedArtifacts, setSelectedArtifacts] = useState({});
  const [endTime, setEndTime] = useState(new Date());
  const [errors, setErrors] = useState({
    gameName: "",
    gameCode: "",
    artifacts: "",
    locations: "",
  });
  const [artifactOptions, setArtifactOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [artifactsLoading, setArtifactsLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const { width } = useWindowDimensions();
  const scale = size => (width / guidelineBaseWidth) * size;

  const { user } = useAuth();

  const baseNode = DATABASE_CONFIG.baseNode;

  const artifacts = useMemo(() => artifactOptions, [artifactOptions]);

  const normalizeCode = (code) => (code || "").trim();

  const buildCatalogOptions = (value) => {
    if (!value || typeof value !== "object") return [];

    const options = Object.entries(value).map(([id, data]) => {
      const name = data?.name ?? id;
      const hint = data?.hint ?? data?.locationHint ?? "";
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
    const fromCatalog = buildCatalogOptions(catalog);
    if (fromCatalog.length > 0) return fromCatalog;

    const artifacts = await fetchNodeValue(`${baseNode}/artifacts`);
    return buildCatalogOptions(artifacts);
  };

  const buildLocationsFromArtifacts = (value) => {
    if (!value || typeof value !== "object") return [];

    const locations = new Map();
    for (const [artifactId, artifact] of Object.entries(value)) {
      const locationName = artifact?.locationName?.trim();
      if (!locationName) continue;

      const id = locationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      if (!locations.has(id)) {
        locations.set(id, {
          id,
          name: locationName,
          hint: artifact?.locationHint ?? artifact?.hint ?? "",
          raw: {
            name: locationName,
            hint: artifact?.locationHint ?? artifact?.hint ?? "",
            description: artifact?.locationDescription ?? "",
            latitude: artifact?.latitude,
            longitude: artifact?.longitude,
            artifacts: {},
          },
        });
      }

      locations.get(id).raw.artifacts[artifactId] = true;
    }

    return [...locations.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  const fetchLocationOptions = async () => {
    const catalog = await fetchNodeValue(`${baseNode}/LocationCatalog`);
    const fromCatalog = buildCatalogOptions(catalog);
    if (fromCatalog.length > 0) return fromCatalog;

    const locations = await fetchNodeValue(`${baseNode}/locations`);
    const fromLocations = buildCatalogOptions(locations);
    if (fromLocations.length > 0) return fromLocations;

    const artifactCatalog = await fetchNodeValue(`${baseNode}/ArtifactCatalog`);
    return buildLocationsFromArtifacts(artifactCatalog);
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

  const getSelectedLocationsForArtifacts = (selectedIds) => {
    const locations = new Map();

    for (const artifactId of selectedIds) {
      const artifact = artifactOptions.find((item) => item.id === artifactId);
      if (!artifact) continue;

      const locationName = artifact.raw?.locationName?.trim();
      const locationId = artifact.raw?.locationId ||
        (locationName
          ? locationName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_|_$/g, "")
          : null);
      if (!locationId) continue;

      const catalogLocation = locationOptions.find(
        (location) =>
          location.id === locationId ||
          location.name === locationName
      );

      locations.set(locationId, catalogLocation || {
        id: locationId,
        name: locationName || locationId,
        hint: artifact.hint || "",
        raw: {
          name: locationName || locationId,
          hint: artifact.hint || "",
          latitude: artifact.raw?.latitude,
          longitude: artifact.raw?.longitude,
          artifacts: {
            [artifactId]: true,
          },
        },
      });
    }

    return [...locations.values()];
  };

  const buildLocationsMapForSession = (selectedIds) => {
    const map = {};
    for (const location of getSelectedLocationsForArtifacts(selectedIds)) {
      map[location.id] = {
        ...(location.raw || {}),
        name: location.name,
        hint: location.hint || location.raw?.hint || "",
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

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLocationsLoading(true);
      try {
        const options = await fetchLocationOptions();
        if (isMounted) setLocationOptions(options);
      } catch (e) {
        console.error("Failed to load locations:", e);
        if (isMounted) setLocationOptions([]);
      } finally {
        if (isMounted) setLocationsLoading(false);
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

    const selectedLocationArray = getSelectedLocationsForArtifacts(selectedArray)
      .map((location) => location.id);

    setErrors(newErrors);
    return { valid, selectedArray, selectedLocationArray };
  };

  const handleCreateGame = async () => {
    const { valid, selectedArray, selectedLocationArray } = await validateForm();
    if (!valid) return;

    const normalizedCode = normalizeCode(gameCode);
    const artifactsMap = buildArtifactsMapForSession(selectedArray, artifactOptions);
    const locationsMap = buildLocationsMapForSession(selectedArray);

    const sessionData = {
      sessionName: gameName.trim(),
      sessionCode: normalizedCode,
      creatorId: user?.uid ?? "unknown",
      gameState: "LOBBY",
      startTime: new Date().toISOString(),
      endTime: endTime.toISOString(),
      participants: {},
      artifacts: artifactsMap,
      locations: locationsMap,
    };

    console.log("current user ", user);
    console.log(sessionData.creatorId);

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
      <Input placeholder="Enter game name" value={gameName} onChangeText={setGameName} backgroundColor={COLORS.white}></Input>

      {errors.gameName && <Text style={{ color: 'red' }}>{errors.gameName}</Text>}

      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>Game Code (no spaces)</Text>
      <Input
        placeholder="Enter game code"
        value={gameCode}
        onChangeText={setGameCode}
        autoCapitalize="none"
        backgroundColor={COLORS.white}
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
        <TouchableOpacity style={[styles.timeButton, { backgroundColor: COLORS.yellow }]} onPress={() => adjustTime(3)}>
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
          <View key={artifact.id} style={[styles.artifactRow, { marginTop: scale(15) }]}>
            <TouchableOpacity
              style={[styles.checkbox, { width: scale(22), height: scale(22), marginRight: scale(10) }]}
              onPress={() => toggleArtifact(artifact.id)}
            >
              {selectedArtifacts[artifact.id] && <View style={{ width: scale(14), height: scale(14), backgroundColor: COLORS.yellow }} />}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: scale(14) }}>{artifact.name}</Text>
              {!!artifact.hint && <Text style={{ fontSize: scale(12), color: COLORS.gray }}>{artifact.hint}</Text>}
            </View>
          </View>
        ))
      )}
      {errors.artifacts && <Text style={{ color: 'red', marginTop: 5 }}>{errors.artifacts}</Text>}

      <Text style={[styles.label, { fontSize: scale(SIZES.body), marginTop: scale(15), marginBottom: scale(5) }]}>
        Locations Included
      </Text>
      <Text style={{ marginTop: scale(5), color: COLORS.gray, fontFamily: 'Figtree_400Regular' }}>
        Locations are included automatically based on the selected artifacts.
      </Text>
      {getSelectedLocationsForArtifacts(
        Object.keys(selectedArtifacts).filter((id) => selectedArtifacts[id])
      ).map((location) => (
        <View key={location.id} style={[styles.artifactRow, { marginTop: scale(15) }]}>
          <View style={[styles.locationIndicator, { width: scale(22), height: scale(22), marginRight: scale(10) }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", fontSize: scale(14) }}>{location.name}</Text>
            {!!location.hint && <Text style={{ fontSize: scale(12), color: COLORS.gray }}>{location.hint}</Text>}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: scale(30), gap: SPACING.lg}}>
        <BasicButton backgroundColor={COLORS.navy} onPress={() => navigation.goBack()} text="Cancel" textColor="white" width="45%"></BasicButton>

        <BasicButton backgroundColor={COLORS.yellow} onPress={creating ? undefined : handleCreateGame} text={creating ? "Creating…" : "Create Game"} textColor="white" width={"45%"}disabled={creating}></BasicButton>
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
  timeBox: {
    backgroundColor: "white",
    borderColor: COLORS.beige,
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
    borderColor: COLORS.gray,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  locationIndicator: {
    borderRadius: 11,
    backgroundColor: COLORS.yellow,
  },
  checked: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.yellow, // gold
  },
  artifactName: {
    fontWeight: "600",
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  artifactHint: {
    fontSize: 12,
    color: COLORS.gray,
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
    backgroundColor: COLORS.beige,
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