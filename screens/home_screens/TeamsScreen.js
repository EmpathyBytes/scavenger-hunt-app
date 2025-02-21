import React from 'react'
import { Text, View, StyleSheet, Dimensions, Image, FlatList } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');


const members = [
  {
    id: 1,
    name: "User 1",
    score: "200"
  },
  {
    id: 2,
    name: "User 2",
    score: "200"
  },
  {
    id: 3,
    name: "User 3",
    score: "200"
  },
  {
    id: 4,
    name: "User 4",
    score: "200"
  }
];
// not sure why this was Artifacts Screen (was probably just copy/pasted)?
const TeamsScreen = () => {
  //load font
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // fetch Firebase session  here
  const teams = members.sort((a,b) => b.score - a.score)
                .map((item, index) => ({
                    ...item,
                }));
 

                // a little worried about the paddingTop...
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 150}}>
      <View style={styles.podiumContainter}>
        <View style={styles.podiumRectangle}> 
          <Text>Team 1</Text>
          <View style={[styles.rectangle, { height: height * 0.17, backgroundColor: '#FFCD47' }]}>
            <Image style={styles.silverImage} source={require('../../assets/silver-medal.png')} />
          </View>
        </View>
        <View style={styles.podiumRectangle}>
          <Text>Team 2</Text>
          <View style={[styles.rectangle, { height: height * 0.22, backgroundColor: '#EEB210' }]}>
            <Image style={styles.goldImage} source={require('../../assets/gold-medal.png')} />
          </View>
        </View>
        <View style={styles.podiumRectangle}>
          <Text>Team 3</Text>
          <View style={[styles.rectangle, { height: height * 0.12, backgroundColor: '#FFCD47' }]}>
            <Image style={styles.bronzeImage} source={require('../../assets/bronze-medal.png')} />
          </View>
        </View>
      </View>
      <SafeAreaView>
        <Text>Your Teams </Text>
        <FlatList
          data={teams}
          renderItem={({item}) => <Text>{item.name} {item.score}</Text>}
          keyExtractor={item => item.name}
        />
      </SafeAreaView>

      <Text>Teams Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  podiumContainter: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  rectangle: {
    width: '100%', // width * 0.20 then center images later
    position: 'relative'
  },
  podiumRectangle: {
    position: 'relative',
    alignItems: 'center'
  },
  goldImage: {
    zIndex: 2
  },
  silverImage: {
    resizeMode: 'contain',
    zIndex: 2
  },
  bronzeImage: {
    zIndex: 2
  },
})
export default TeamsScreen