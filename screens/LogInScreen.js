import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Alert } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import auth from '@react-native-firebase/auth'; // Firebase Auth import

const LogInScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('JoinSessionScreen'); // Navigate after successful login
    } catch (error) {
      Alert.alert('Error', error.message); // Display error message if login fails
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>{"<"}</Text>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        placeholder="email"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="password"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <BasicButton
        text="Log in"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={handleLogin}
      />
      <Text style={styles.signupText}>
        Don’t have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUpScreen')}>
          Sign up
        </Text>
      </Text>
    </View>
  );
};

export default LogInScreen;