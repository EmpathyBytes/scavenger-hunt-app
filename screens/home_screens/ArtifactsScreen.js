import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import React, {useState, useEffect, useContext} from 'react'
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import BackButton from '../../components/BackButton';
import LocationButton from '../../components/LocationButton';

const ArtifactsScreen = ({ setScreenIndex, navigation }) => {
  const questionMark = "../../assets/QuestionMark.png";
  const artifacts = require('../../dummy_data/artifacts.json')
  //load font
  const [fontsLoaded] = useFonts({
      Figtree_400Regular,
      Figtree_600SemiBold,
  });
  
  if (!fontsLoaded) {
    return null;
  }

  const data = Object.values(artifacts);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '10%'}}>
      <FlatList 
        data={data}
        renderItem={({item}) => 
          <LocationButton image={require(questionMark)} onPress={() => {setScreenIndex(5);}} />
        }
        numColumns={3}
        columnWrapperStyle={{gap: '12%', marginBottom: '8%'}}>
      </FlatList>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop:'20'}}>
        <Text style={{ fontSize: 28}}>Artifacts</Text>
      </View>

    </View>
  )

}

 export default ArtifactsScreen