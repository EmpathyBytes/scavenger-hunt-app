import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './home_screens/MapScreen';
import ProfileScreen from './home_screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="MapScreen">
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      <Tab.Screen name="MapScreen" component={MapScreen} />
    </Tab.Navigator>
  )
}

export default HomeScreen