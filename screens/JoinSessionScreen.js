import React from 'react'
import { Button, Text, View } from 'react-native';

const JoinSessionScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Join Session Screen</Text>
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('HomeScreen')}
      />
    </View>
  )
}

export default JoinSessionScreen