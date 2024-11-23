import { COLORS, SIZES } from './theme';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';


export default function BackButton({ backgroundColor = 'transparent', color = COLORS.navy, size = 32, onPress }) {

    return (
        <TouchableOpacity style={[{backgroundColor: backgroundColor}, styles.container]} onPress={onPress}>
            <Entypo name="chevron-left" size={size} color={color} />
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    container: {
        height: 30,
		width: 30,
		marginHorizontal: 30,
    },
})