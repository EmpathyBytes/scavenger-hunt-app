import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { COLORS, SIZES } from "../../components/theme";
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  useFonts,
} from "@expo-google-fonts/figtree";
import LocationButton from "../../components/LocationButton";
import { useAuth } from "../../contexts/AuthContext";
import { useServices } from "../../contexts/ServiceContext";
import { ArtifactsContext } from "../../contexts/ArtifactsContext";
import { LocationsContext } from "../../contexts/LocationsContext";
import { database } from "../../firebase_config";
import { ref, onValue } from "firebase/database";
import { DATABASE_CONFIG } from "../../config/config";

const ArtifactsScreen = ({ setScreenIndex, navigation }) => {
  const [foundArtifactIds, setFoundArtifactIds] = useState([]);
  const { user } = useAuth();
  const { userService } = useServices();
  const { artifacts } = useContext(ArtifactsContext);
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

        // Set up real-time listener for found artifacts
        const foundArtifactsPath = `${DATABASE_CONFIG.baseNode}/users/${user.uid}/sessionsJoined/${sessionId}/foundArtifacts`;
        const foundArtifactsRef = ref(database, foundArtifactsPath);

        unsubscribe = onValue(foundArtifactsRef, (snapshot) => {
          const foundMap = snapshot.val() || {};
          setFoundArtifactIds(Object.keys(foundMap));
        });
      } catch (error) {
        console.error("Error setting up found artifacts listener:", error);
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
        data={artifacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const found = foundArtifactIds.includes(item.id);
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
                    navigation.navigate("ArtifactInfoScreen", {
                      foundItem: item,
                    })
                  }
                >
                  {item.name}
                </Text>
              </View>
            );
          } else {
            return (
              <View style={{ margin: 4 }}>
                <LocationButton
                  image={require("../../assets/QuestionMark.png")}
                />
              </View>
            );
          }
        }}
        numColumns={3}
        columnWrapperStyle={{ gap: "12%", marginBottom: "8%" }}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 20,
        }}
      ></View>
    </View>
  );
};

export default ArtifactsScreen;
