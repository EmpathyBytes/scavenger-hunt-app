import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import auth from '@react-native-firebase/auth'; // Firebase Auth import

const SignUpScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('JoinSessionScreen'); // Navigate after successful signup
    } catch (error) {
      Alert.alert('Error', error.message); // Display error message if signup fails
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>{"<"}</Text>
      <Text style={styles.title}>Create Account</Text>
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
      <TextInput
        placeholder="confirm password"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <BasicButton
        text="Sign up"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={handleSignUp}
      />
    </View>
  );
};

export default SignUpScreen;