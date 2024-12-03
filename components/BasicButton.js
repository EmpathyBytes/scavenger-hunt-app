import { COLORS, SIZES } from './theme';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'

export default function BasicButton({ text, backgroundColor, textColor, onPress }) {
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TouchableOpacity style={[{backgroundColor: backgroundColor}, styles.container]} onPress={onPress}>
            <Text style={[{color: textColor}, styles.text]}>
                {text}
            </Text>
        </TouchableOpacity>
    );
}

//example button component
{/*<BasicButton
    text="Log in"
    backgroundColor={COLORS.navy}
    textColor={COLORS.beige}
    onPress={() => navigation.navigate('LogInScreen')}/>*/}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 13,
        width: "80%",
        borderRadius: 15,
    },
    text: {
        fontSize: SIZES.body,
        fontFamily: "Figtree_400Regular",
    }
})