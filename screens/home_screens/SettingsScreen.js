import React, { useRef } from 'react'
import { useState } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../components/theme'; //colors and sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BasicButton from '../../components/BasicButton';

const SettingsScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('Username');
  // this is needed to specify a DOM element to open keyboard
  const inputRef = useRef(null);

  const navigation = useNavigation();
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const finishEditing = () => {
    setIsEditing(false);
  };
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 13 }}>
      <View style={styles.usernameContainer}>
        { isEditing ? 
          ( <TextInput style={styles.usernameText} value={username} onChangeText={setUsername} onSubmitEditing={finishEditing} ref={inputRef} returnKeyType="done"/> )
          : ( <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                <Text style={styles.usernameText}> {username} </Text>
                <TouchableOpacity>
                  <Pressable onPress={handleEditing}>
                    <Image style={styles.editImage} source={require('../../assets/Edit.png')} />
                  </Pressable>
                </TouchableOpacity> 
              </View>
           )}
      </View>
      <View style={styles.circle}>
        <TouchableOpacity style={styles.profileContainer}>
          <Image style={styles.circleImage} source={require('../../assets/User.png')} />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.gameCodeText}> Game Code: GyWXQ </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <BasicButton text={'See Past Results'} backgroundColor={COLORS.navy} textColor={COLORS.beige} onPress={() => navigation.navigate('PastResultsScreen')}/>
        <BasicButton text={'Notifications'} backgroundColor={COLORS.navy} textColor={COLORS.beige} />
        <BasicButton text={'Leave Session'} backgroundColor={COLORS.navy} textColor={COLORS.beige} />
        <BasicButton text={'Log Out'} backgroundColor={COLORS.navy} textColor={COLORS.beige} />
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
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.heading,
    color: COLORS.navy,
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
    backgroundColor: COLORS.gray,
    borderRadius: "100%",
  },
  circleImage: {
    margin: 'auto',
    width: '50%',
    height: '50%',
  },
  gameCodeText: {
    fontFamily: 'Figtree_400Regular',
    color: COLORS.navy,
    fontSize: SIZES.body_small,
    //fontWeight: '600',
    marginVertical: 10
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12
  },
  profileContainer: {
    margin: 'auto',
    width: '100%',
    height: '100%',
  }
});

export default SettingsScreen