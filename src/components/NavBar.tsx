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
    backgroundOpacity?: Animated.AnimatedInterpolation | Animated.Value;
}

const NavBar: React.FC<NavBarProps> = ({ titleOpacity, backgroundOpacity }) => {
    const title = useSharedStore((s) => s.navigationTitle);
    const statusBarHeight = getStatusBarHeight();
    
    const animatedBackgroundStyle = backgroundOpacity ? {
        backgroundColor: backgroundOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
        }),
    } : {};
    
    return (
        <Animated.View 
            pointerEvents="none" 
            style={[
                styles.container, 
                { paddingTop: statusBarHeight },
                animatedBackgroundStyle
            ]}
        > 
            <Animated.Text 
                numberOfLines={1} 
                style={[
                    styles.title, 
                    titleOpacity ? { opacity: titleOpacity } : null
                ]}
            >
                {title}
            </Animated.Text>
        </Animated.View>
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
        backgroundColor: 'transparent', // 初始透明，通过动画控制
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
    },
});

export default NavBar;