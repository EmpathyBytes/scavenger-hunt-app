import React from 'react';
import { Text, ImageBackground, TextInput, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton'
import BackButton from '../components/BackButton';

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
        <ImageBackground
        	style={styles.map}
        	source={require('../assets/map.png')}
        	resizeMode="cover"
        	>
        	<LinearGradient
        	    colors={['rgba(255, 255, 255, .1)', 'rgba(255, 249, 217, 1)']}
        	    style={styles.gradient}
        	/>
        	<Image
        	    style={styles.bee}
        		source={require('../assets/bee.png')}
        	/>
        	<Image
        	    style={styles.mapLine}
        	    source={require('../assets/map-line.png')}
        	/>
            <View style={styles.box}>
        	    <View style={styles.logInBox} style={{ alignItems: 'center' }}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Log in to continue your quest!</Text>

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#B0B0B0"
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#B0B0B0"
                        style={styles.input}
                        secureTextEntry
                    />
                    <BasicButton text="Log In"
                        style={styles.logInButton}
                        backgroundColor={COLORS.navy}
                        textColor={COLORS.beige}
                        onPress={() => navigation.navigate('JoinSessionScreen')}/>
                    <Text style={styles.logInText}>
                        Don’t have an account?{' '}
                        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUpScreen')}>
                            Sign up
                        </Text>
                    </Text>
                </View>
            </View>
            <Image
                style={styles.cross}
                source={require('../assets/cross.png')}
            />
            <View style={styles.button} pointerEvents="none">

                <BasicButton
                    text="Play"
                    backgroundColor={COLORS.navy}
                    textColor={COLORS.beige}
                    //onPress={() => navigation.navigate('LogInScreen')
                />

        	</View>
        </ImageBackground>
    </View>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Figtree_600SemiBold',
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
    width: '70%',
    paddingBottom: 100,
    marginTop: 40,
    marginBottom: 5,
    textAlign: 'center',
    alignSelf: 'center'
  },
  subtitle: {
  	fontSize: SIZES.body,
  	fontFamily: 'Figtree_400Regular',
  	color: COLORS.darkGray,
  	marginTop: -70,
  	marginBottom: 30,
  	textAlign: 'center',
  	alignSelf: 'center'
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
    alignSelf: 'center'
  },
  logInText: {
    marginBottom: 200,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    textAlign: 'center',
    marginTop: 10,
  },
  signupLink: {
    color: COLORS.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  bee: {
    height: 120,
    objectFit: 'contain',
    position: 'absolute',
    alignSelf: 'center',
    top: '15%',
    zIndex: 0,
    opacity: 0.7,
  },
  mapLine: {
      alignSelf: 'center',
      height: 550,
      objectFit: 'contain',
      position: 'absolute',
      top: '25%',
      zIndex: 0,
      opacity: 0.5,
    },
  cross: {
    height: 110,
    width: 110,
    objectFit: 'contain',
    alignSelf: 'center',
    zIndex: 1,
    marginTop: -30,
    position: 'absolute',
    bottom: '3.6%',
    opacity: 0.9,
  },
  map: {
    flex: 1,
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  logInBox: {
    position: 'center',
    top: '22.5%',
    },
  button: {
    width: '30%',
    zIndex: 2,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: '7%',

  },
  box: {
    backgroundColor: COLORS.beige,
    borderRadius: 20,
    alignSelf: 'center',
    zIndex: 2,
    height: 500,
    marginTop: 180,
  },
  logInButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
    width: '50%',
  },
});