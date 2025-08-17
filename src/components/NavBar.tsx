import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import { useSharedStore } from '../store/store';

const getStatusBarHeight = (): number => {
    if (Platform.OS === 'android') {
        return StatusBar.currentHeight ? StatusBar.currentHeight : 0;
    }
    // iOS 简单取 44 作为沉浸式安全区高度近似
    return 44;
};

interface NavBarProps {
    titleOpacity?: Animated.AnimatedInterpolation | Animated.Value;
}

const NavBar: React.FC<NavBarProps> = ({ titleOpacity }) => {
    const title = useSharedStore((s) => s.navigationTitle);
    const statusBarHeight = getStatusBarHeight();
    return (
        <View pointerEvents="none" style={[styles.container, { paddingTop: statusBarHeight }]}> 
            <Animated.Text numberOfLines={1} style={[styles.title, titleOpacity ? { opacity: titleOpacity } : null]}>{title}</Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 44 + 44, // 预留状态栏 + 导航栏高度
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default NavBar;


