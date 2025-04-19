import React, {useState, useEffect, useContext} from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree' //font
import BackButton from '../../components/BackButton';
import {MarkersContext} from '../../contexts/MarkersContext'; // Import the context
import {HintContext} from '../../contexts/HintContext'; // Import the context

const HintScreen = ({setScreenIndex, locationCurr, navigation, setForceReload}) => {

    
    const location = locationCurr.current;
    
    const { markers } = useContext(MarkersContext); // Access the markers from the context
    const {hint: hintInfo, setHint: setHintInfo} = useContext(HintContext); // Access the hintInfo from the context
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
        if (earthRadius * c <= 0.04) {
            setFoundText("You found the location!")
            addMarker();
        } else {
            setFoundText("No lmao");
        }
    };

    const addMarker = () => {
        //Adds a marker to the map (in HomeScreen) at the hint location
        if (!markers.current?.some(e => e.key == hintInfo.locationName)) {
            markers.current?.push({
                key: hintInfo.locationName,
                coordinate: {
                    latitude: hintInfo.latitude,
                    longitude: hintInfo.longitude,
                },
                title: hintInfo.locationName,
                description: hintInfo.description,
            });
        }
        //console.log(markers.current);
        //console.log(hintInfo);
        setForceReload((prev) => prev + 1);
        navigation.navigate('FoundScreen', {navigation});
        
    }

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
        width: '100%',
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