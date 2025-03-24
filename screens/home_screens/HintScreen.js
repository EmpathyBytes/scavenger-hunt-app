import React, {useState} from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BackButton from '../../components/BackButton';

const HintScreen = ({hintInfo, setScreenIndex, location}) => {
    const [found, setFound] = useState(false);
    const [diff, setDiff] = useState(0.6);
    const [foundText, setFoundText] = useState("");
    
    const CoordDistance = () => {
        //Computes the distance in miles between hint location and player location
        const earthRadius = 3958.75; // miles (or 6371.0 kilometers)
        const dLat = (hintInfo.latitude-location.coords.latitude) * (Math.PI / 180);
        const dLng = (hintInfo.longitude-location.coords.longitude) * (Math.PI / 180);
        const sindLat = Math.sin(dLat / 2);
        const sindLng = Math.sin(dLng / 2);
        const a = Math.pow(sindLat, 2) + Math.pow(sindLng, 2)
                * Math.cos(location.coords.latitude * (Math.PI / 180)) * Math.cos(hintInfo.latitude * (Math.PI / 180));
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        if (earthRadius * c <= 0.5) {
            setFoundText("You found the location!")
        } else {
            setFoundText("No lmao");
        }
    };


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
            <BackButton style={{marginBottom: 20, size:48}} backgroundColor={COLORS.beige} onPress={() => {setScreenIndex(1)}} />
            <Text style={styles.hintLabel}> Hint: </Text>
            <Text style={styles.hintText}>
                {hintInfo.locationHint}
            </Text>
            <TouchableOpacity style={styles.buttonContainer} onPress = {() => {CoordDistance()}}>
                <Text style={[styles.hintText, {color:COLORS.white}]}> Check Location </Text>
            </TouchableOpacity>
            <Text style={[styles.hintText, {textAlign: 'center'}]}>
                {foundText}
            </Text>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.beige,
    },
    hintLabel: {
        fontFamily: "Figtree_600SemiBold",
        fontSize: 30,
        marginBottom: 10,
    },
    hintText: {
        fontFamily: "Figtree_400Regular",
        fontSize: 20,
        marginBottom: 20,
        textAlignVertical: "center",
    },
    buttonContainer: {
        backgroundColor: COLORS.navy,
        borderRadius: 15,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        width: 200,
    }
});

export default HintScreen