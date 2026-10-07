import { SPACING, SIZES, COLORS} from './theme';
import { StyleSheet, TextInput } from 'react-native';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree'

export default function Input({...props}) {
    //load font
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <TextInput style={[styles.input, props.style]}{...props}></TextInput>
    );
}

const styles = StyleSheet.create({
        input: {
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.xs,
            borderRadius: SIZES.radius_component,
            borderColor: COLORS.gray,
            fontFamily: Figtree_400Regular,
            fontSize: SIZES.body,
        }
    });