import React from 'react'
import { Button, Text, View } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome Screen</Text>
      <Button
        title="Log in"
        onPress={() => navigation.navigate('LogInScreen')}
      />
    </View>
  )
}

export default WelcomeScreen