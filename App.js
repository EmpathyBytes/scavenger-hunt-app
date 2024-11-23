import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import LogInScreen from './screens/LogInScreen';
import SignUpScreen from './screens/SignUpScreen';
import JoinSessionScreen from './screens/JoinSessionScreen';
import PastResultsScreen from './screens/PastResultsScreen';

const Stack = createNativeStackNavigator();

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
      </Stack.Navigator>
  </NavigationContainer>
  );
}

