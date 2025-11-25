import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
import { LocationsProvider } from './contexts/LocationsContext'; // Unified context
import { ServiceProvider } from './contexts/ServiceContext';
import { SessionGuardProvider } from './contexts/SessionGuardContext';
// Import your screens
import WelcomeScreen from './screens/WelcomeScreen';
import LogInScreen from './screens/LogInScreen';
import SignUpScreen from './screens/SignUpScreen';
import JoinSessionScreen from './screens/JoinSessionScreen';
import HomeScreen from './screens/HomeScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import PastResultsScreen from './screens/PastResultsScreen';
// ...other imports

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <LocationsProvider>
          <NavigationContainer>
            <SessionGuardProvider>
              <Stack.Navigator initialRouteName="WelcomeScreen" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                <Stack.Screen name="LogInScreen" component={LogInScreen} />
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                <Stack.Screen name="JoinSessionScreen" component={JoinSessionScreen} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
                <Stack.Screen name="PastResultsScreen" component={PastResultsScreen} />
                {/* Add other screens here */}
              </Stack.Navigator>
            </SessionGuardProvider>
          </NavigationContainer>
        </LocationsProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}

