import React from 'react'
import { Text, View, Image, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../components/theme'; //colors and sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import { TouchableOpacity } from 'react-native-gesture-handler';
import BasicButton from '../../components/BasicButton';

const SettingsScreen = () => {
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 13 }}>
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameText} >Username</Text>
        <Image style={styles.editImage} source={require('../../assets/Edit.png')} />
      </View>
      <View style={styles.circle}>
        <Image style={styles.circleImage} source={require('../../assets/User.png')} />
      </View>
      <View>
        <Text style={styles.gameCodeText} >Game code: GyWXQ</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <BasicButton text={'See past results'} backgroundColor={'#182E51'} textColor={'#FFF9D9'} />
        <BasicButton text={'Notifications'} backgroundColor={'#182E51'} textColor={'#FFF9D9'} />
        <BasicButton text={'Leave Session'} backgroundColor={'#182E51'} textColor={'#FFF9D9'} />
        <BasicButton text={'Log Out'} backgroundColor={'#182E51'} textColor={'#FFF9D9'} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  usernameText: {
    fontSize: 45,
    color: '#182E51'
  },
  editImage: {
    // borderColor: 'red',
    // borderWidth: 2,
    height: 23,
    width: 23
  },
  circle: {
    height: 200,
    width: 200,
    backgroundColor: '#D9D9D9',
    borderRadius: "100%",
  },
  circleImage: {
    margin: 'auto',
    width: '50%',
    height: '50%',
  },
  gameCodeText: {
    color: '#182E51',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12
  },
  button: {
    backgroundColor: '#182E51',
    margin: 'auto',
    width: '75%',
    height: 55,
    borderRadius: 15,
  },
  buttonText: {
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#FFF9D9',
    fontSize: 24
  }
});

export default SettingsScreen