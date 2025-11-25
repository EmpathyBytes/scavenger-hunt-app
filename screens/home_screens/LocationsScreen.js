import React, { useState, useEffect, useContext } from "react";
import { Text, View, FlatList } from "react-native";
import { COLORS, SIZES } from "../../components/theme";
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  useFonts,
} from "@expo-google-fonts/figtree";
import LocationButton from "../../components/LocationButton";
import { useAuth } from "../../contexts/AuthContext";
import { useServices } from "../../contexts/ServiceContext";
import { LocationsContext } from "../../contexts/LocationsContext";
import { database } from "../../firebase_config";
import { ref, onValue } from "firebase/database";
import { DATABASE_CONFIG } from "../../config/config";

const LocationsScreen = ({ setScreenIndex, navigation }) => {
  const [foundLocations, setFoundLocations] = useState([]);
  const { user } = useAuth();
  const { userService } = useServices();
  const { locations } = useContext(LocationsContext);
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

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
          setFoundLocations(Object.keys(locationsMap));
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
  }, [user, userService]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: "10%",
      }}
    >
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const found = foundLocations.includes(item.id);
          if (found) {
            return (
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#e4ffd4",
                  margin: 4,
                }}
              >
                <Text
                  style={{ fontSize: 16, textAlign: "center" }}
                  onPress={() =>
                    navigation?.navigate &&
                    navigation.navigate("FoundItemInfoScreen", {
                      foundItem: item,
                    })
                  }
                >
                  {item.name || item.id}
                </Text>
              </View>
            );
          } else {
            console.log(item)
            return (
              <View style={{ margin: 4 }}>
                <LocationButton
                  image={require("../../assets/QuestionMark.png")}
                  onPress={() =>
                    navigation?.navigate &&
                    navigation.navigate("FoundItemInfoScreen", {
                      foundItem: {
                        name: "Hint",
                        description:
                          item?.hint ||
                          item?.locationHint ||
                          "Hint coming soon.",
                      },
                    })
                  }
                />
              </View>
            );
          }
        }}
        numColumns={3}
        columnWrapperStyle={{ gap: "15%", marginBottom: "5%" }}
      />
    </View>
  );
};

export default LocationsScreen;
