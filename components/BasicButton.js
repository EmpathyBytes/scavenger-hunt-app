import { SPACING, SIZES } from './theme';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'

export default function BasicButton({ text, backgroundColor, textColor, fontSize=SIZES.body, onPress, width, ...rest}) {
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TouchableOpacity style={[{backgroundColor: backgroundColor},  width ? {width} : null, styles.container]} onPress={onPress} {...rest}>
            <Text style={[{color: textColor}, {fontSize: fontSize}, { fontFamily: rest.fontFamily || "Figtree_400Regular"}]}>
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