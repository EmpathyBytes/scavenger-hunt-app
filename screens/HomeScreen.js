import React, { useRef, useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  Button,
  Modal,
  Text,
  Dimensions,
  Alert,
} from "react-native";
import LocationsScreen from "./home_screens/LocationsScreen";
import ArtifactsScreen from "./home_screens/ArtifactsScreen";
import SettingsScreen from "./home_screens/SettingsScreen";
import { COLORS, SIZES } from "../components/theme"; //colors and font sizes
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  useFonts,
} from "@expo-google-fonts/figtree"; //font
import BottomSheet, {
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import LeaderboardScreen from "./home_screens/LeaderboardScreen";
import { useAuth } from "../contexts/AuthContext";
import { useServices } from "../contexts/ServiceContext";
import { LocationsContext } from "../contexts/LocationsContext";
import { ArtifactsContext } from "../contexts/ArtifactsContext";
import { UserService } from "../services/UserService";
import { DATABASE_CONFIG } from "../config/config";
import { database } from "../firebase_config";
import { ref, onValue } from "firebase/database";
import LocationModal from "../components/LocationModal";

const { height, width } = Dimensions.get("window");

// Add new helper to calculate distance
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = 6371e3; // earth radius meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
}

const HomeScreen = ({ navigation }) => {
  const location = useRef({});
  const { locations } = useContext(LocationsContext); // Always up-to-date
  const { artifacts } = useContext(ArtifactsContext); // Access artifacts from context
  const { user } = useAuth();
  const { userService } = useServices();
  const [errorMsg, setErrorMsg] = useState({});
  const [currentSession, setCurrentSession] = useState(null);
  const [foundLocationIds, setFoundLocationIds] = useState([]);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      if (user?.uid) {
        try {
          const session = await userService.getCurrentSession(user.uid);
          setCurrentSession(session);
        } catch (error) {
          console.error("Error fetching current session:", error);
        }
      } else {
        setCurrentSession(null);
      }
    };

    fetchCurrentSession();
  }, [user, userService]);

  // Set up real-time listener for found locations
  useEffect(() => {
    if (!user?.uid || !userService) return;

    let unsubscribe = null;

    const setupListener = async () => {
      try {
        const sessionId = await userService.getCurrentSession(user.uid);
        if (!sessionId) return;

        // Set up real-time listener for found locations
        const foundLocationsPath = `${DATABASE_CONFIG.baseNode}/users/${user.uid}/sessionsJoined/${sessionId}/locationsFound`;
        const foundLocationsRef = ref(database, foundLocationsPath);

        unsubscribe = onValue(foundLocationsRef, (snapshot) => {
          const locationsMap = snapshot.val() || {};
          setFoundLocationIds(Object.keys(locationsMap));
        });
      } catch (error) {
        console.error("Error setting up found locations listener:", error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, userService, currentSession]);

  const [mapReady, setMapReady] = useState(false);
  const [forceReload, setForceReload] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [locationModalContent, setLocationModalContent] = useState({
    title: "",
    description: "",
  });
  // Load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const bottomSheetRef = useRef(null);
  const [screenIndex, setScreenIndex] = useState(1);
  const [selectedArtifactId, setSelectedArtifactId] = useState(null);

  const handlePress = (idx) => {
    setScreenIndex(idx);
  };

  // Initial region in the middle of Tech
  const INITIAL_REGION = {
    latitude: 33.778307260053026,
    longitude: -84.39842128239762,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  if (!fontsLoaded) {
    return null;
  }

  // Filter locations to get only found ones with coordinates
  const foundLocations = locations.filter(
    (location) =>
      foundLocationIds.includes(location.id) &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
  );

  async function handleCheckNearbyLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission required",
          "Please allow location access in app settings."
        );
        return;
      }
      if (!Array.isArray(locations) || locations.length === 0) {
        Alert.alert(
          "Locations not loaded",
          "Please wait a moment for locations to load, then try again."
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = pos.coords;
      let found = null;
      for (const loc of locations) {
        if (
          typeof loc.latitude === "number" &&
          typeof loc.longitude === "number"
        ) {
          const dist = getDistanceMeters(
            latitude,
            longitude,
            loc.latitude,
            loc.longitude
          );
          if (dist <= 50) {
            found = loc;
            break;
          }
        }
      }
      if (found) {
        if (foundLocationIds.includes(found.id)) {
          Alert.alert(
            "Already Found",
            `You have already found: ${found.name || found.id}`
          );
          return;
        }
        const userId = user?.uid;
        const sessionId = currentSession;
        if (!userId || !sessionId) {
          Alert.alert("Error", "User or session not found.");
          return;
        }
        await userService.addFoundLocation(userId, sessionId, found.id);
        // Before awarding artifacts on location found, collect artifact IDs correctly
        const artifactIds =
          found.artifacts &&
          typeof found.artifacts === "object" &&
          !Array.isArray(found.artifacts)
            ? Object.keys(found.artifacts)
            : [];
        console.log("Artifact IDs for reward:", artifactIds);
        let pointsToAdd = 0;
        const artifactsArray = Array.isArray(artifacts) ? artifacts : [];
        const artifactNames = [];
        for (const artifactId of artifactIds) {
          await userService.addFoundArtifact(userId, sessionId, artifactId);
          const artifactObj = artifactsArray.find(
            (a) => a && a.id === artifactId
          );
          const artifactLabel = artifactObj?.name || artifactId;
          artifactNames.push(artifactLabel);
          if (artifactObj && typeof artifactObj.points === "number") {
            pointsToAdd += artifactObj.points;
          }
        }
        await userService.updatePoints(userId, sessionId, pointsToAdd);

        const artifactsDescription =
          artifactNames.length > 0
            ? `Artifacts:\n- ${artifactNames.join("\n- ")}`
            : "Artifacts:\n- None";
        setLocationModalContent({
          title: found.name || found.id,
          description: artifactsDescription,
        });
        setModalVisible(true);
      } else {
        setLocationModalContent({
          title: "No Location Nearby",
          description: "Keep looking!",
        });
        setModalVisible(true);
      }
    } catch (err) {
      Alert.alert("Error", `Failed to check nearby location: ${err}`);
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        key={forceReload}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onMapReady={() => {
          setMapReady(true);
          console.log("Map loaded");
        }}
        showsBuildings
        showsUserLocation
      >
        {/* Render markers for found locations */}
        {foundLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name || location.id}
            description={location.description || ""}
          />
        ))}
      </MapView>
      <View style={styles.infoButtonWrapper}>
        <TouchableOpacity
          style={{ position: "absolute", top: "1%", right: "1%" }}
          onPress={() => navigation.navigate("AboutUsScreen")}
        >
          <Image
            style={styles.infoIcon}
            source={require("../assets/info-button.png")}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.findButtonWrapper}>
        <TouchableOpacity
          style={{ position: "absolute", top: "20%", right: "20%" }}
          onPress={handleCheckNearbyLocation}
        >
          <Image
            style={styles.infoIcon}
            source={require("../assets/locations.png")}
          />
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["13%", "90%"]}
        index={0}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#FFF9D9" }}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/*These are the buttons to switch between screens. */}
          <View style={styles.buttonNavigationContainer}>
            <TouchableOpacity
              style={[
                styles.touchableStyle,
                screenIndex == 0 && styles.selectedOption,
              ]}
              onPress={() => handlePress(0)}
            >
              <Image
                style={styles.icon}
                source={require("../assets/teams.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.touchableStyle,
                screenIndex == 1 && styles.selectedOption,
              ]}
              onPress={() => handlePress(1)}
            >
              <Image
                style={styles.icon}
                source={require("../assets/locations.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.touchableStyle,
                screenIndex == 2 && styles.selectedOption,
              ]}
              onPress={() => handlePress(2)}
            >
              <Image
                style={styles.icon}
                source={require("../assets/artifacts.png")}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.touchableStyle,
                screenIndex == 3 && styles.selectedOption,
              ]}
              onPress={() => handlePress(3)}
            >
              <Image
                style={styles.icon}
                source={require("../assets/settings.png")}
              />
            </TouchableOpacity>
          </View>
          {/*Object placed here is dependent on the screenIndex changed by buttons above*/}
          {screenIndex == 0 && currentSession && (
            <LeaderboardScreen
              navigation={navigation}
              route={{ params: { sessionId: currentSession } }}
            />
          )}
          {screenIndex == 1 && (
            <LocationsScreen
              setScreenIndex={setScreenIndex}
              navigation={navigation}
            />
          )}
          {screenIndex == 2 && (
            <ArtifactsScreen
              setScreenIndex={setScreenIndex}
              navigation={navigation}
            />
          )}
          {screenIndex == 3 && <SettingsScreen />}
          {screenIndex == 5 && selectedArtifactId && (
              <ArtifactInfoScreen route={{ params: { id: selectedArtifactId } }} setScreenIndex={setScreenIndex} />
          )}  
        </BottomSheetView>
      </BottomSheet>
      <LocationModal
        visible={modalVisible}
        setModalVisible={setModalVisible}
        title={locationModalContent.title}
        description={locationModalContent.description}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 5,
    alignItems: "center",
    zIndex: 1,
  },
  button: {
    height: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  touchableStyle: {
    padding: 5,
    borderRadius: 10,
  },
  buttonNavigationContainer: {
    width: "75%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedOption: {
    backgroundColor: "#EEB210",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  infoIcon: {
    height: 50,
    width: 50,
    alignSelf: "center",
    //zIndex: 3,
    objectFit: "contain",
  },
  infoIconWrap: {
    alignSelf: "center",
    //zIndex: 3,
    //width: 10,
    marginTop: 40,
    paddingLeft: 300,
    objectFit: "contain",
    position: "absolute",
    top: 20,
    right: 20,
  },
  icon: {
    objectFit: "contain",
    height: 50,
    width: 50,
  },
  infoButtonWrapper: {
    position: "absolute",
    top: "6%",
    right: "3%",
    zIndex: 5,
  },
  findButtonWrapper: {
    position: "absolute",
    top: "6%",
    right: "16%",
    zIndex: 5,
  },
  modal: {
    flex: 1,
    alignSelf: "center",
    backgroundColor: COLORS.beige,
    zIndex: 2,
    width: "80%",
    marginLeft: width * 0.25,
    padding: 20,
    alignItems: "center",
    borderRadius: 20,
  },
});

export default HomeScreen;
