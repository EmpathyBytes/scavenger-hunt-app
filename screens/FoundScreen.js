import React, {useContext} from 'react';
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import {COLORS, SIZE} from '../components/theme';
import {HintContext} from '../contexts/HintContext'; // Import the context
import BasicButton from '../components/BasicButton';


const FoundScreen = ({navigation}) => {
    const {hint: hintInfo} = useContext(HintContext); // Access the hintInfo from the context
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.foundText}>{hintInfo.locationName}</Text>
            <Image source={require('../assets/student_center.jpeg')} style={{width: '90%', height: '40%', borderRadius:20}}></Image>
            <Text style={styles.descText}>Description: {hintInfo.description}</Text>
            <BasicButton text="Go to Map" onPress={() => navigation.navigate('HomeScreen')} backgroundColor={COLORS.navy} textColor={COLORS.beige}/>
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
        fontSize: 30,
        fontWeight: 'bold',
        marginVertical: 20,
        color: COLORS.navy,
    },
    descText: {
        fontSize: 20,
        marginVertical: 10,
        fontFamily: "Figtree_400Regular",
        color: COLORS.navy,
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