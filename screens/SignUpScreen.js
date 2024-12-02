import React from 'react';
import { Image, Text, TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import BackButton from '../components/BackButton';

const SignUpScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.goBack()} />
      </View>
      <Image
        style={styles.bee}
        source={require('../assets/bee.png')}/>
      <Text style={styles.title}>Create Account</Text>
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
      <TextInput
        placeholder="confirm password"
        placeholderTextColor="#B0B0B0"
        style={styles.input}
        secureTextEntry
      />
      <BasicButton
        text="Sign up"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('JoinSessionScreen')}/>
    </View>
  );
};

export default SignUpScreen;

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
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  bee: {
    height: 140,
    objectFit: 'contain',
    alignSelf: 'center',
  }
});