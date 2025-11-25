import React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { COLORS, SIZES } from "../components/theme";
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  useFonts,
} from "@expo-google-fonts/figtree";
import BackButton from "../components/BackButton";

const ArtifactInfoScreen = ({ navigation, route }) => {
  const foundItem = route?.params?.foundItem;
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }
  function Model({ asset }) {
    const [uri, setUri] = useState(null);

    useEffect(() => {
      (async () => {
        const expoAsset = Asset.fromModule(asset);
        await expoAsset.downloadAsync();
        setUri(expoAsset.localUri || expoAsset.uri);
      })();
    }, [asset]);

    // Only call useGLTF if uri is available
    if (!uri) return null;
    const { scene } = useGLTF(uri);
    return <primitive object={scene} />;
  }
  const image = require("../assets/Buzz_Statue.png"); // Placeholder image

  return (
    <View style={styles.container}>
      <BackButton
        style={{ marginTop: 50, marginLeft: 30, marginBottom: 10, size: 48 }}
        backgroundColor={COLORS.beige}
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.infoLabel}>{foundItem?.name || "No Name"}</Text>
      {/* Placeholder image. You may use foundItem?.imageUrl if it exists */}
      <Image source={image} style={styles.image} />

      <Text style={styles.infoText}>
        {foundItem?.description || "No description available."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    width: "100%",
  },
  infoLabel: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: 50,
    marginTop: 50,
    marginBottom: 10,
    textAlign: "center",
  },
  infoText: {
    fontFamily: "Figtree_400Regular",
    fontSize: 20,
    marginTop: 50,
    marginBottom: 20,
    textAlignVertical: "center",
    paddingHorizontal: 20,
    textAlign: "center",
  },
  // Uncomment if using image
  image: {
      width: 120,
      height: 120,
      alignSelf: 'center',
      marginBottom: 16,
  },
});

export default ArtifactInfoScreen;
