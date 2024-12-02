import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import LogInScreen from './screens/LogInScreen';
import SignUpScreen from './screens/SignUpScreen';
import JoinSessionScreen from './screens/JoinSessionScreen';
import PastResultsScreen from './screens/PastResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id',
    measurementId: 'your-measurement-id'
  });
} else {
  firebase.app(); // Use the default app
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="WelcomeScreen"
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
        />
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
        />
        <Stack.Screen
          name="LogInScreen"
          component={LogInScreen}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
        />
        <Stack.Screen
          name="JoinSessionScreen"
          component={JoinSessionScreen}
        />
        <Stack.Screen
          name="PastResultsScreen"
          component={PastResultsScreen}
        />
        <Stack.Screen
          name="LeaderboardScreen"
          component={LeaderboardScreen}
        />
      </Stack.Navigator>
  </NavigationContainer>
  );
}

