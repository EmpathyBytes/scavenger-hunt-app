import { COLORS, SIZES } from './theme';
import { Image, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'


export default function LocationButton({ image, text, backgroundColor, textColor, onPress }) {
    const questionMark = "../assets/QuestionMark.png";
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image source={image}/>
        </TouchableOpacity>
    );
}

//example button component
{/*<LocationButton
    image={require(imageURI)}
    onPress={() => 'set screen to hint screen passing along the artifact's necessary information'   
    />*/}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        alignItems: "center",
        justifyContent: "center",
        //paddingVertical: 13,
        //marginHorizontal: '9%',
        //marginVertical: '2%',
        width: "75",
        height: "75",
        borderRadius: 15,
        backgroundColor: "#D9D9D9",
    },
    text: {
        fontSize: SIZES.body,
        fontFamily: "Figtree_400Regular",
    }
})