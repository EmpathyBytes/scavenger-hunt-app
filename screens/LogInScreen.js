import React from 'react'
import { Button, Text, View } from 'react-native';

const LogInScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Log In Screen</Text>
      <Button
        title="Sign up"
        onPress={() => navigation.navigate('SignUpScreen')}
      />
    </View>
  )
}

export default LogInScreen