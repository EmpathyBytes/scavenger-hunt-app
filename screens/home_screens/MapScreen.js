import React, {useContext} from 'react'
import { Text, View, FlatList } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import LocationButton from '../../components/LocationButton';

const MapScreen = ({setScreenIndex}) => {
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
          <LocationButton image={require(questionMark)} onPress={() => {setHintInfo(item); setScreenIndex(4);}} />
        }
        numColumns={3}
        columnWrapperStyle={{gap: '15%', marginBottom: '5%'}}>
      </FlatList>

    </View>
  )
}

export default MapScreen