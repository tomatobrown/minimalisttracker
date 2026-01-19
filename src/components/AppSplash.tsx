import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';

interface AppSplashProps {
    onFinish: () => void;
}

// Simple, smooth intro animation overlay
export const AppSplash: React.FC<AppSplashProps> = ({ onFinish }) => {
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.05,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(scale, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                delay: 250,
                duration: 450,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onFinish();
        });
    }, [opacity, scale, onFinish]);

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <Image
                    source={require('../../assets/images/splash-icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    card: {
        width: Math.min(width * 0.55, 260),
        height: Math.min(width * 0.55, 260),
        borderRadius: 28,
        backgroundColor: '#E6F4FE',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
    },
    logo: {
        width: '70%',
        height: '70%',
    },
});

export default AppSplash;
