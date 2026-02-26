import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationsProvider } from "./contexts/LocationsContext"; // Unified context
import { ServiceProvider } from "./contexts/ServiceContext";
import { ArtifactsProvider } from "./contexts/ArtifactsContext";
// Import your screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LogInScreen from "./screens/LogInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import JoinSessionScreen from "./screens/JoinSessionScreen";
import HomeScreen from "./screens/HomeScreen";
import AboutUsScreen from "./screens/AboutUsScreen";
import PastResultsScreen from "./screens/PastResultsScreen";
import ArtifactInfoScreen from "./screens/ArtifactInfoScreen";
import LocationInfoScreen from "./screens/LocationInfoScreen";
import ViewGamesScreen from "./screens/ViewGamesScreen";
import CreateGameScreen from "./screens/CreateGameScreen";
import GamePreviewScreen from "./screens/GamePreviewScreen";
// ...other imports

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <LocationsProvider>
          <ArtifactsProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="WelcomeScreen"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                <Stack.Screen name="LogInScreen" component={LogInScreen} />
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                <Stack.Screen
                  name="JoinSessionScreen"
                  component={JoinSessionScreen}
                />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
                <Stack.Screen
                  name="PastResultsScreen"
                  component={PastResultsScreen}
                />
                <Stack.Screen
                  name="ArtifactInfoScreen"
                  component={ArtifactInfoScreen}
                />
                <Stack.Screen
                  name="LocationInfoScreen"
                  component={LocationInfoScreen}
                />
                <Stack.Screen name="ViewGamesScreen" component={ViewGamesScreen} />
                <Stack.Screen name="CreateGameScreen" component={CreateGameScreen} />
                <Stack.Screen name="GamePreviewScreen" component={GamePreviewScreen} />
                {/* Add other screens here */}
              </Stack.Navigator>
            </NavigationContainer>
          </ArtifactsProvider>
        </LocationsProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}
