import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import React, {useState, useEffect, useContext} from 'react'
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import BackButton from '../../components/BackButton';
import LocationButton from '../../components/LocationButton';
import { ModelData } from '../../contexts/ModelData';

const ArtifactsScreen = ({ setScreenIndex, setSelectedArtifactId }) => {
  // All hooks at the top, before any return/conditional!
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });
  // selectedArtifactId is now managed by the parent (HomeScreen)

  // Use ModelData as the source of truth for artifacts
  const data = ModelData;

  if (!fontsLoaded) {
    return null;
  }



  // Use ModelData for IDs, but always show the question mark image
  const questionMark = require('../../assets/QuestionMark.png');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '10%'}}>
      <FlatList
        data={ModelData}
        renderItem={({ item }) => (
          <LocationButton
            image={questionMark}
            onPress={() => {
              setSelectedArtifactId(item.id);
              setScreenIndex(5);
            }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ gap: '12%', marginBottom: '8%' }}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
        <Text style={{ fontSize: 28 }}>Artifacts</Text>
      </View>
    </View>
  );

}

 export default ArtifactsScreen;