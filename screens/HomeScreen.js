import React, { useRef, useState, useEffect } from 'react'
import { View, StyleSheet, Image, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TeamsScreen from './home_screens/TeamsScreen';
import MapScreen from './home_screens/MapScreen';
import ArtifactsScreen from './home_screens/ArtifactsScreen';
import SettingsScreen from './home_screens/SettingsScreen';
import { COLORS, SIZES } from '../components/theme'; //colors and font sizes 
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BottomSheet, { BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BasicButton from '../components/BasicButton';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import HintScreen from './home_screens/HintScreen';

const Tab = createBottomTabNavigator();
let locationSubscription = null;

const HomeScreen = ({ navigation }) => {
  const location = useRef({});
  const markers = useRef([]);
  const [errorMsg, setErrorMsg] = useState({});
  
  const [mapReady, setMapReady] = useState(false);
  const [forceReload, setForceReload] = useState(0);

  //On mount, start location tracking. Check if reload of map is necessary (likely is)
  useEffect(() => {
    async function startLocationTracking() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      //Make sure there isn't already a subscription running
      locationSubscription?.remove() 
      //Set a tracker for location updates. On an update, uses the setLocation function to update the location
      locationSubscription = await Location.watchPositionAsync({accuracy: Location.Accuracy.BestForNavigation}, loc => {location.current = loc});
    }
    
    //Fix for map not properly rendering upon mount. Forces reload after two seconds
    const timer = setTimeout(() => {
      if (!mapReady) {
        console.warn('Map was not ready within 2 second. Forcing re-render.');
        setForceReload((prev) => prev + 1);
      }
  }, 2000);

    startLocationTracking();
    return () => { locationSubscription?.remove(); clearTimeout(timer) }; //Remove location tracking and clear timer upon dismount
  }, [mapReady]);

  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const bottomSheetRef = useRef(null);
  const [screenIndex, setScreenIndex] = useState(1);

  const [hintInfo, setHintInfo] = useState({name: "", isChallenge: false, latitude: 0, longitude: 0, locationHint: "", description: ""});

  const handlePress = (idx) => {
    bottomSheetRef.current?.expand();
    setScreenIndex(idx);
  };

  //Initial region in the middle of Tech
  const INITIAL_REGION = {
    latitude: 33.778307260053026, 
    longitude: -84.39842128239762,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="MapScreen">
        <Tab.Screen name="ArtifactsScreen" component={ArtifactsScreen} />
        <Tab.Screen name="MapScreen" component={MapScreen} />
        <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
      </Tab.Navigator> */}

      <MapView 
        key={forceReload} 
        style={styles.map} 
        initialRegion={INITIAL_REGION} 
        onMapReady={() => {setMapReady(true); console.log("Map loaded");}} 
        showsBuildings 
        showsUserLocation 
        >
        {markers.current?.map((marker) => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerSelected(marker)}
          />
        ))}
        </MapView>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={{position: 'absolute', top: '1%', right: '1%'}} onPress={() => navigation.navigate('AboutUsScreen')}>
            <Image
              style={styles.infoIcon}
              source={require('../assets/info-button.png')}/>
          </TouchableOpacity>
      </View>
      
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['13%', '90%']}
        index={0}
        backgroundStyle={{backgroundColor: '#FFF9D9'}}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/*These are the buttons to switch between screens. */}
          <View style={styles.buttonNavigationContainer}>
            <TouchableOpacity 
                style={[styles.touchableStyle, screenIndex == 0 && styles.selectedOption]} 
                onPress={() => handlePress(0)}
            >
              <Image style={styles.icon} source={require('../assets/teams.png')} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.touchableStyle, screenIndex == 1 && styles.selectedOption]} 
                onPress={() => handlePress(1)}
            >
              <Image style={styles.icon} source={require('../assets/locations.png')} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.touchableStyle, screenIndex == 2 && styles.selectedOption]} 
                onPress={() => handlePress(2)}
            >
              <Image style={styles.icon} source={require('../assets/artifacts.png')} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.touchableStyle, screenIndex == 3 && styles.selectedOption]} 
                onPress={() => handlePress(3)}
            >
              <Image style={styles.icon} source={require('../assets/settings.png')} />
            </TouchableOpacity>
          </View>
          {/*Object placed here is dependent on the screenIndex changed by buttons above*/}
          {(screenIndex == 0) && <TeamsScreen />}
          {(screenIndex == 1) && <MapScreen setScreenIndex={setScreenIndex} setHintInfo={setHintInfo}  />}
          {(screenIndex == 2) && <ArtifactsScreen/>}
          {(screenIndex == 3) && <SettingsScreen/>}
          {(screenIndex == 4) && <MarkersProvider> <HintScreen setScreenIndex={setScreenIndex} hintInfo={hintInfo} locationCurr={location} markers={markers}/> </MarkersProvider>}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  )
}

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
    alignItems: 'center',
    zIndex: 1,
  },
  button: {
    height: '10%',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoIcon: {
		height: 50,
		width: 50,
		alignSelf: 'center',
		//zIndex: 3,
		objectFit: 'contain',
	},
	infoIconWrap: {
		alignSelf: 'center',
		//zIndex: 3,
		//width: 10,
		marginTop: 40,
		paddingLeft: 300,
		objectFit: 'contain',
    position: 'absolute',
    top: 20,
    right: 20,
	},
  icon: {
    objectFit: 'contain',
    height: 50, 
    width: 50,
  },
  buttonWrapper: {
    position: 'absolute',
    top: "8%",
    right: "1%",
    zIndex: 5,
  }
});


export default HomeScreen