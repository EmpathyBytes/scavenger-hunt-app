import React from 'react';
import { Text, TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton'

const LogInScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

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
      />
      <TextInput
        placeholder="password"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        secureTextEntry
      />
      <BasicButton text="Log in"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('JoinSessionScreen')}/>
      <Text style={styles.signupText}>
        Don’t have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUpScreen')}>
          Sign up
        </Text>
      </Text>
      {/* TEMPORARY BUTTON */}
      <BasicButton text="Temporary Past Results Button"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('PastResultsScreen')}/>
    </View>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 45,
  },
  backButton: {
    fontSize: 18,
    color: COLORS.darkGray,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.title,
    color: COLORS.navy,
    width: '60%',
    paddingBottom: 100,
    // marginTop: 10,
    // marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: COLORS.darkGray,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body,
  },
  signupText: {
    marginTop: 20,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    textAlign: 'center',
  },
  signupLink: {
    color: COLORS.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
});
