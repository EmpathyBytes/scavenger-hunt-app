import React, { useState, useRef } from 'react';
import { Button, Text, View, StyleSheet, TextInput } from 'react-native';
import { COLORS, SIZES } from '../components/theme'; //colors and font sizes
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BasicButton from '../components/BasicButton';

const JoinSessionScreen = ({ navigation }) => {
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });
  
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleFocus = () => {
    if (value === 'enter game code') {
      setValue('');
    }
  };

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.beige }}>
      <Text style = {styles.title}>Join Session</Text>
      <View style={styles.inputcontainer}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onFocus={handleFocus}
        placeholder="enter game code"
      />
      </View>
      <BasicButton
        text="Join"
        backgroundColor={COLORS.navy}
        textColor={COLORS.beige}
        onPress={() => navigation.navigate('HomeScreen')}/>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.title,
    color: COLORS.navy
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.navy,
    padding: 10,
    borderRadius: 15,
    width: 310,
    height: 50,
  },
  inputcontainer: {
    padding: 17,
    paddingTop: 70,
  }
})

export default JoinSessionScreen