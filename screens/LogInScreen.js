import React from 'react'
import { Button, Text, View } from 'react-native';
import { COLORS, SIZES } from '../components/theme'; //colors and font sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font

const LogInScreen = ({ navigation }) => {
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
      <Text>Log In Screen</Text>
      <Button
        title="Sign up"
        onPress={() => navigation.navigate('SignUpScreen')}
      />
    </View>
  )
}

export default LogInScreen