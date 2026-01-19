import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import { PaywallScreen } from '../screens/PaywallScreen';

interface SubscriptionGateProps {
    children: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const access = await subscriptionService.hasAccess();
            setHasAccess(access);
            if (!access) {
                setShowPaywall(true);
            }
        } catch (error) {
            console.error('Error checking access:', error);
            // Default to showing content if check fails
            setHasAccess(true);
        }
    };

    const handleDismiss = async () => {
        // Recheck access after attempting purchase
        await checkAccess();
    };

    if (hasAccess === null) {
        // Loading state - show nothing while checking
        return <View style={styles.container} />;
    }

    return (
        <>
            {children}
            <Modal
                visible={showPaywall && !hasAccess}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <PaywallScreen onDismiss={handleDismiss} />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
