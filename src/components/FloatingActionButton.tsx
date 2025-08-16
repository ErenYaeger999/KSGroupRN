import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FloatingActionButtonProps {
    onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onPress,
}) => {
    return (
        <View style={styles.container} pointerEvents="box-none">
            <TouchableOpacity
                style={styles.button}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text style={styles.plus}>＋</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        bottom: 32,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ff5b5b',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },
    plus: {
        color: '#fff',
        fontSize: 28,
        lineHeight: 32,
    },
});

export default FloatingActionButton;
