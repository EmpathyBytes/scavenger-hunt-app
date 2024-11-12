import React, { useRef, useState } from 'react'
import { View, StyleSheet, Image, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TeamsScreen from './home_screens/TeamsScreen';
import ArtifactsScreen from './home_screens/ArtifactsScreen';
import SettingsScreen from './home_screens/SettingsScreen';
import { COLORS, SIZES } from '../components/theme'; //colors and font sizes 
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BottomSheet, { BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  //load font
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.flex}>
      <Button
        title="About us screen"
        onPress={() => navigation.navigate('AboutUsScreen')}
      />
      {/* <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="MapScreen">
        <Tab.Screen name="ArtifactsScreen" component={ArtifactsScreen} />
        <Tab.Screen name="MapScreen" component={MapScreen} />
        <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
      </Tab.Navigator> */}
      <GestureHandlerRootView style={styles.container}>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={['13%', '90%']}
          index={0}
          backgroundStyle={{backgroundColor: '#FFF9D9'}}
        >
          <BottomSheetView style={styles.contentContainer}>
            <View style={styles.buttonNavigationContainer}>
              <TouchableOpacity 
                  style={[styles.touchableStyle, screenIndex == 0 && styles.selectedOption]} 
                  onPress={() => handlePress(0)}
              >
                <Image source={require('../assets/teams.png')} />
              </TouchableOpacity>
              <TouchableOpacity 
                  style={[styles.touchableStyle, screenIndex == 1 && styles.selectedOption]} 
                  onPress={() => handlePress(1)}
              >
                <Image source={require('../assets/artifacts.png')} />
              </TouchableOpacity>
              <TouchableOpacity 
                  style={[styles.touchableStyle, screenIndex == 2 && styles.selectedOption]} 
                  onPress={() => handlePress(2)}
              >
                <Image source={require('../assets/settings.png')} />
              </TouchableOpacity>
            </View>
            {(screenIndex == 0) && <TeamsScreen />}
            {(screenIndex == 1) && <ArtifactsScreen/>}
            {(screenIndex == 2) && <SettingsScreen/>}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
  },
  touchableStyle: {
    padding: 5,
    borderRadius: 10,
  },
  buttonNavigationContainer: {
    width: '75%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  selectedOption: {
    backgroundColor: '#EEB210',
  }
});


export default HomeScreen