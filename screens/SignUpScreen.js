import React from 'react'
import { Button, Text, View } from 'react-native';

const SignUpScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Sign Up Screen</Text>
      <Button
        title="Join session"
        onPress={() => navigation.navigate('JoinSessionScreen')}
      />
    </View>
  )
}

export default SignUpScreen