import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../components/theme';
import { useFonts, Figtree_400Regular, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import { auth, createUserWithEmailAndPassword } from '../firebase';

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
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('LogInScreen');
    } catch (error) {
      Alert.alert('Error', error.message);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#B0B0B0',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
  },
});

export default SignUpScreen;
