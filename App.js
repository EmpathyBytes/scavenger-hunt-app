import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
import { MarkersProvider } from './contexts/MarkersContext';
import { ServiceProvider } from './contexts/ServiceContext';
// Import your screens
import WelcomeScreen from './screens/WelcomeScreen';
import LogInScreen from './screens/LogInScreen';
import SignUpScreen from './screens/SignUpScreen';
import JoinSessionScreen from './screens/JoinSessionScreen';
import HomeScreen from './screens/HomeScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import PastResultsScreen from './screens/PastResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
// ...other imports

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <MarkersProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="WelcomeScreen" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
              <Stack.Screen name="LogInScreen" component={LogInScreen} />
              <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
              <Stack.Screen name="JoinSessionScreen" component={JoinSessionScreen} />
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
              <Stack.Screen name="PastResultsScreen" component={PastResultsScreen} />
              <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />
              {/* Add other screens here */}
            </Stack.Navigator>
          </NavigationContainer>
        </MarkersProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}

