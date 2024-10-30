import React from 'react'
import { Button, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './home_screens/MapScreen';
import ProfileScreen from './home_screens/ProfileScreen';
import SettingsScreen from './home_screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  //need to add normal navigation stack - but there's complications with that - figure that out later
  return (
    <View>
      <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="MapScreen">
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
        <Tab.Screen name="MapScreen" component={MapScreen} />
        <Tab.Screen name="SettingsScreen" component={SettingsScreen} />
      </Tab.Navigator>
      <Button
        title="About us screen"
        onPress={() => navigation.navigate('AboutUsScreen')}
      />
    </View>
  )
}

export default HomeScreen