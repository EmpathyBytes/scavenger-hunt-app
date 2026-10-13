import { COLORS } from './theme';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

export default function BackButton({ style = {}, backgroundColor = 'transparent', color = COLORS.navy, size = 32, onPress }) {

    return (
        <TouchableOpacity style={[style, {backgroundColor: backgroundColor}, styles.button]} onPress={onPress}>
            <Entypo name="chevron-left" size={size} color={color} />
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    button: {
        height: 32,
		width: 32,
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