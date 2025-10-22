import React, { useRef, useState, useEffect, useContext, } from 'react'
import { View, StyleSheet, Image, Button, Modal, Text, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MarkersContext } from '../contexts/MarkersContext'; // Import the context
import { HintContext } from '../contexts/HintContext';
import TeamsScreen from './home_screens/TeamsScreen';
import MapScreen from './home_screens/MapScreen';
import ArtifactsScreen from './home_screens/ArtifactsScreen';
import SettingsScreen from './home_screens/SettingsScreen';
import { COLORS, SIZES } from '../components/theme'; //colors and font sizes 
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BottomSheet, { BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BasicButton from '../components/BasicButton';
import MapView, {Marker, Callout} from 'react-native-maps';
import * as Location from 'expo-location';
import HintScreen from './home_screens/HintScreen';
import LeaderboardScreen from './LeaderboardScreen';

const Tab = createBottomTabNavigator();
let locationSubscription = null;
const {height, width} = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const location = useRef({});
  const { markers } = useContext(MarkersContext);
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
  }, 5000);

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

      <MapView key={forceReload} style={styles.map} initialRegion={INITIAL_REGION} onMapReady={() => {setMapReady(true); console.log("Map loaded");}} showsBuildings showsUserLocation> 
        {/* This is where the markers are placed on the map. The markers are passed in from the context. */}
        {markers.current?.map((marker) => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
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
          {(screenIndex == 0) && <LeaderboardScreen navigation={navigation} route={{ params: { sessionID: 1 } }} />}
          {(screenIndex == 1) && <MapScreen setScreenIndex={setScreenIndex} />}
          {(screenIndex == 2) && <ArtifactsScreen/>}
          {(screenIndex == 3) && <SettingsScreen/>}
          {(screenIndex == 4) && <HintScreen setScreenIndex={setScreenIndex} locationCurr={location} navigation={navigation} setForceReload={setForceReload}/>}
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
  },
  modal: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: COLORS.beige,
    zIndex: 2,
    width: '80%',
    marginLeft: width * 0.25,
    padding: 20,
    alignItems: 'center',
    borderRadius: 20,
  }
});


export default HomeScreen