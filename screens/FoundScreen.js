import React, {useContext} from 'react';
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import {COLORS, SIZE} from '../components/theme';
import {HintContext} from '../contexts/HintContext'; // Import the context


const FoundScreen = ({navigation}) => {
    const {hint: hintInfo} = useContext(HintContext); // Access the hintInfo from the context
    return (
        <SafeAreaView style={styles.container}>
            <Image source={require('../assets/center_street_north.jpg')} style={{width: '100%', height: '70%'}}></Image>
            <Text style={styles.foundText}>You found {hintInfo.locationName}</Text>
            <Text style={styles.foundText}>Description: {hintInfo.description}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.button}>
                <Text style={styles.buttonText}>Go to Map</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.beige,
    },
    foundText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
}

export default FoundScreen;