import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
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
import AdminControlsScreen from './screens/AdminControlsScreen';
import MySessionsScreen from './screens/MySessionsScreen';
import CreateSessionScreen from './screens/CreateSessionScreen';
import SessionDetailsScreen from './screens/SessionDetailsScreen';
// ...other imports

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
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
            <Stack.Screen name="AdminControlsScreen" component={AdminControlsScreen} />
            <Stack.Screen name="MySessionsScreen" component={MySessionsScreen} />
            <Stack.Screen name="CreateSessionScreen" component={CreateSessionScreen} />
            <Stack.Screen name="SessionDetailsScreen" component={SessionDetailsScreen} />
            {/* Add other screens here */}
          </Stack.Navigator>
        </NavigationContainer>
      </ServiceProvider>
    </AuthProvider>
  );
}

