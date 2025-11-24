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
import BackButton from "../../components/BackButton";
import LocationButton from "../../components/LocationButton";
import { useAuth } from "../../contexts/AuthContext";
import { useServices } from "../../contexts/ServiceContext";
import { ArtifactsContext } from "../../contexts/ArtifactsContext";

const ArtifactsScreen = ({ setScreenIndex, navigation }) => {
  const [foundArtifactIds, setFoundArtifactIds] = useState([]);
  const { user } = useAuth();
  const { userService } = useServices();
  const { artifacts } = useContext(ArtifactsContext);
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  useEffect(() => {
    const fetchFoundArtifacts = async () => {
      if (user && user.uid && userService) {
        const userObj = await userService.getUser(user.uid);
        if (
          !userObj ||
          !userObj.currentSession ||
          !userObj.sessionsJoined[userObj.currentSession]
        )
          return;
        const foundMap =
          userObj.sessionsJoined[userObj.currentSession].foundArtifacts;
        setFoundArtifactIds(Object.keys(foundMap));
      }
    };
    fetchFoundArtifacts();
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
                  style={{ fontSize: 16, color: "green", textAlign: "center" }}
                >
                  {item.name} ⭐
                </Text>
              </View>
            );
          } else {
            return (
              <View style={{ margin: 4 }}>
                <LocationButton
                  image={require("../../assets/QuestionMark.png")}
                  onPress={() => {
                    setScreenIndex(5);
                  }}
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
      >
      </View>
    </View>
  );
};

export default ArtifactsScreen;
