import React from 'react'
import { Text, View, StyleSheet, Image } from 'react-native';
import { COLORS, SIZES } from '../components/theme'; //colors and font sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BasicButton from '../components/BasicButton';

const AboutUsScreen = ({ navigation }) => {
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}>
        About
      </Text>
      <Text
        style={styles.description}>
        what this app is and all that fun stuff
      </Text>
      <Text
        style={styles.description}>
        how to play the game and what it's for
      </Text>
      <Image
        style={styles.icon}
        source={require('../assets/empathybytes.png')}
      />
      <Text
        style={styles.description}>
        Empathy Bytes
      </Text>
      <BasicButton
        text="Learn More"
        backgroundColor={COLORS.gold}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('HomeScreen')}/>
    </View>
  )
}

export default AboutUsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    alignItems: "center",
    padding: 45
  },
  title: {
    fontFamily: "Figtree_400Regular",
    fontSize: 45,
    marginTop: 10,
    marginBottom: 40,
  },
  description: {
    fontFamily: "Figtree_400Regular",
    fontSize: 20,
    marginBottom: 20
  },
  icon: {
    width: 250,
    height: 250,
    marginTop: 40,
    marginBottom: 10,
  },
})