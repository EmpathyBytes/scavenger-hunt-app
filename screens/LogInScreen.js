import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../components/theme';
import { useFonts, Figtree_400Regular, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import { auth, signInWithEmailAndPassword } from '../firebase';

const LogInScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('JoinSessionScreen');
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
  signupText: {
    textAlign: 'center',
    marginTop: 10,
  },
  signupLink: {
    color: COLORS.navy,
    fontWeight: '600',
  },
});

export default LogInScreen;
