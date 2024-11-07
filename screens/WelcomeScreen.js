import React from 'react'
import { Button, Text, View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'
import BasicButton from '../components/BasicButton';

const WelcomeScreen = ({ navigation }) => {
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={styles.title}>Welcome Screen</Text>
      <Button
        title="Log in"
        onPress={() => navigation.navigate('LogInScreen')}
      />
      <BasicButton
        text="Welcome"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('LogInScreen')}/>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
  title: {
    fontFamily: "Figtree_400Regular",
  },
})