import { SPACING, SIZES, COLORS} from './theme';
import { StyleSheet, TextInput } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'

export default function Input({style, ...props}) {
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TextInput style={[styles.input, style]}{...props} placeholderTextColor={COLORS.gray}></TextInput>
    );
}

const styles = StyleSheet.create({
        input: {
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.sm,
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: SIZES.radius_component_s,
            borderColor: COLORS.black,
            fontFamily: Figtree_400Regular,
            fontSize: SIZES.body,
        }
    });