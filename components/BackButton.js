import { COLORS } from './theme';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

export default function BackButton({ style = style, backgroundColor = 'transparent', color = COLORS.navy, size = 32, onPress }) {

    return (
        <TouchableOpacity style={[style, {backgroundColor: backgroundColor}, styles.button]} onPress={onPress}>
            <Entypo name="chevron-left" size={size} color={color} />
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    button: {
        height: 30,
		width: 30,
		//marginHorizontal: 30,
    },
})

// example implementation:
// <BackButton backgroundColor={COLORS.beige} onPress={()=>navigation.navigate('LogInScreen')} />

// default implementation:
// * required parameter: onPress
// * background: transparent
// * arrow color: navy
// * size: 32 pixels