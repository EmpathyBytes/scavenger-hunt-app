import { SPACING, SIZES } from './theme';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'

export default function BasicButton({ text, backgroundColor, textColor, fontSize=SIZES.body, onPress, width}) {
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TouchableOpacity style={[{backgroundColor: backgroundColor},  width ? {width} : null, styles.container]} onPress={onPress}>
            <Text style={[{color: textColor}, fontSize=fontSize, styles.text]}>
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
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: SIZES.radius_component,
    },
    text: {
        fontFamily: "Figtree_400Regular",
    }
})