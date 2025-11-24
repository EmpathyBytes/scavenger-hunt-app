import React, { useRef, useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  Button,
  Modal,
  Text,
  Dimensions,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import MapView from "react-native-maps";
import * as Location from "expo-location";
import LeaderboardScreen from "./home_screens/LeaderboardScreen";
import * as TaskManager from "expo-task-manager";
import ArtifactInfoScreen from "./ArtifactInfoScreen";
import LocationModal from "../components/LocationModal";
import { useAuth } from "../contexts/AuthContext";
import { useServices } from "../contexts/ServiceContext";
import { LocationsContext } from "../contexts/LocationsContext";

const { height, width } = Dimensions.get("window");

const GEOFENCE_TASK = "geofenceTask";

// This will be triggered when the user enters or exits a region
TaskManager.defineTask(
  GEOFENCE_TASK,
  async ({ data: { eventType, region }, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    if (eventType === Location.GeofencingEventType.Enter) {
      console.log(`Entered geofence: ${region.identifier}`);

      try {
        const { user } = useAuth();
        const { userService } = useServices();
        const userId = user?.uid;
        // Dynamically fetch sessionId
        const sessionId = await userService.getCurrentSession(userId);
        const { locations } = LocationsContext._currentValue;
        const { artifacts } = require("../contexts/ArtifactsContext")
          .ArtifactsContext._currentValue || { artifacts: [] };
        const location = locations.find((loc) => loc.id === region.identifier); // Match by id

        if (!location) {
          console.error(
            `Location with ID ${region.identifier} not found in context.`
          );
          return;
        }

        await userService.addFoundLocation(userId, sessionId, location.id);

        // Robust: Only process if artifacts can be found and are arrays
        const artifactIds = Array.isArray(location.artifacts)
          ? location.artifacts
          : [];

        let pointsToAdd = 0;
        for (const artifactId of artifactIds) {
          await userService.addFoundArtifact(userId, sessionId, artifactId);
          const artifactObj = Array.isArray(artifacts)
            ? artifacts.find((a) => a && a.id === artifactId)
            : null;
          if (artifactObj && typeof artifactObj.points === "number") {
            pointsToAdd += artifactObj.points;
          }
        }
        await userService.updatePoints(userId, sessionId, pointsToAdd);

        console.log(
          `Geofence entry handled for user ${userId}, session ${sessionId}`
        );
      } catch (error) {
        console.error("Error processing geofence entry:", error);
      }
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log(`Exited geofence: ${region.identifier}`);
    }
  }
);

const HomeScreen = ({ navigation }) => {
  const location = useRef({});
  const { locations } = useContext(LocationsContext); // Access locations from unified context
  const { user } = useAuth();
  const { userService } = useServices();
  const [errorMsg, setErrorMsg] = useState({});
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      if (user?.uid && !currentSession) {
        try {
          const session = await userService.getCurrentSession(user.uid);
          setCurrentSession(session);
        } catch (error) {
          console.error("Error fetching current session:", error);
        }
      }
    };

    fetchCurrentSession();
  }, [user, userService]);

  const [mapReady, setMapReady] = useState(false);
  const [forceReload, setForceReload] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  // const [enteredRegion, setEnteredRegion] = useState(null);

  //On mount, start location tracking. Check if reload of map is necessary (likely is)
  useEffect(() => {
    async function startGeofencing() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const regions = locations.map((location) => ({
        identifier: location.id, // Use id, not name, for geofence
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 1000, // meters — adjust as needed
        notifyOnEnter: true,
        notifyOnExit: true,
      }));

      if (!regions || regions.length === 0) return;

      // stop any existing geofence session
      try {
        await Location.stopGeofencingAsync(GEOFENCE_TASK);
      } catch (e) {}

      console.log("Starting geofencing for", regions.length, "locations...");
      await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
    }

    startGeofencing();
  }, [locations]);

  // Load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const bottomSheetRef = useRef(null);
  const [screenIndex, setScreenIndex] = useState(1);

  const handlePress = (idx) => {
    bottomSheetRef.current?.expand();
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
        onPress={() => {
          setModalVisible(true);
        }}
      >
        {/* Remove marker rendering logic */}
        {/* No markers will be displayed on the map */}
      </MapView>
      <View style={styles.buttonWrapper}>
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

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["13%", "90%"]}
        index={0}
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
          {screenIndex == 0 && (
            <LeaderboardScreen
              navigation={navigation}
              route={{ params: { sessionId: currentSession } }}
            />
          )}
          {screenIndex == 1 && <LocationsScreen setScreenIndex={setScreenIndex} />}
          {screenIndex == 2 && (
            <ArtifactsScreen setScreenIndex={setScreenIndex} />
          )}
          {screenIndex == 3 && <SettingsScreen />}
        </BottomSheetView>
      </BottomSheet>
      <LocationModal visible={modalVisible} setModalVisible={setModalVisible} />
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
  buttonWrapper: {
    position: "absolute",
    top: "8%",
    right: "1%",
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
