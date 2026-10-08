import { SPACING, SIZES } from './theme';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'

// When redoing the UI redo this so it mathces Input where its just style and {...props} as arguements 
export default function BasicButton({ text, backgroundColor, textColor, fontSize=SIZES.body, onPress, width, fontFamily="Figtree_400Regular", disabled, borderColor, borderWidth, flex}) {
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TouchableOpacity style={[{backgroundColor: backgroundColor}, {borderColor: borderColor}, {borderWidth: borderWidth}, width ? {width} : null, styles.container, {flex: flex}]} onPress={onPress} disabled={disabled} borderWidth={borderWidth}>
            <Text style={[{color: textColor}, {fontSize: fontSize}, {fontFamily: fontFamily}]}>
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
    }
})