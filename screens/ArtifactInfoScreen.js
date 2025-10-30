import React from 'react'
import { Text, View, StyleSheet, Image } from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BackButton from '../components/BackButton';

const ArtifactInfoScreen = ({ navigation, setScreenIndex }) => {

    //load font
    const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
    return null;
    }

    return (
        <View style={styles.container}>
            <BackButton style={{marginBottom: 20, size:48}} backgroundColor={COLORS.beige} onPress={() => {setScreenIndex(2)}} />

            <Text style={styles.infoLabel}> Buzz's Converse </Text>
            <Image source={require('../assets/buzzconverse.png')} style={styles.image} />
            <Text style={styles.infoLabel}> Fun Fact: </Text>
            <Text style={styles.infoText}>
                When Adidas took over as Georgia Tech's apparel provider in 2018, Buzz ditched his old Converse Chuck's for some custom-designed Adidas sneakers!
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.beige,
        width: '100%',
    },
    infoLabel: {
        fontFamily: "Figtree_600SemiBold",
        fontSize: 30,
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        fontFamily: "Figtree_400Regular",
        fontSize: 20,
        marginBottom: 20,
        textAlignVertical: "center",
        paddingHorizontal: 20,
        textAlign: 'center',
    }
});

export default ArtifactInfoScreen;