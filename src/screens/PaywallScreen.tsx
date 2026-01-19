import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService';
import { PurchasesPackage } from 'react-native-purchases';

interface PaywallScreenProps {
    onDismiss?: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ onDismiss }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [subscriptionStatus, availablePackages] = await Promise.all([
                subscriptionService.getSubscriptionStatus(),
                subscriptionService.getOfferings(),
            ]);
            setStatus(subscriptionStatus);
            setPackages(availablePackages);
        } catch (error) {
            console.error('Error loading paywall data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (pkg: PurchasesPackage) => {
        setPurchasing(true);
        try {
            const result = await subscriptionService.purchasePackage(pkg);
            if (result.success) {
                Alert.alert('Success!', 'Thank you for subscribing!', [
                    { text: 'OK', onPress: onDismiss },
                ]);
            } else if (result.error && result.error !== 'Purchase cancelled') {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to complete purchase');
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        try {
            const result = await subscriptionService.restorePurchases();
            if (result.success) {
                if (result.error) {
                    Alert.alert('No Purchases Found', result.error);
                } else {
                    Alert.alert('Success!', 'Your purchases have been restored!', [
                        { text: 'OK', onPress: onDismiss },
                    ]);
                }
            } else {
                Alert.alert('Error', result.error || 'Failed to restore purchases');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore purchases');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, isDark && styles.containerDark]}>
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            </View>
        );
    }

    // Find lifetime and monthly packages
    const lifetimePackage = packages.find(
        (pkg) => pkg.identifier === '$rc_lifetime' || pkg.product.identifier.includes('lifetime')
    );
    const monthlyPackage = packages.find(
        (pkg) => pkg.identifier === '$rc_monthly' || pkg.product.identifier.includes('monthly')
    );

    return (
        <ScrollView
            style={[styles.container, isDark && styles.containerDark]}
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.header}>
                <Text style={[styles.title, isDark && styles.textDark]}>
                    End of Day Premium
                </Text>

                {status?.isInTrial && (
                    <View style={styles.trialBadge}>
                        <Text style={styles.trialText}>
                            {status.trialDaysRemaining} days left in your free trial
                        </Text>
                    </View>
                )}

                <Text style={[styles.subtitle, isDark && styles.textDark]}>
                    Track your daily progress and build better habits
                </Text>
            </View>

            <View style={styles.features}>
                <FeatureItem text="Unlimited custom questions" isDark={isDark} />
                <FeatureItem text="Detailed trend analysis" isDark={isDark} />
                <FeatureItem text="Daily notifications" isDark={isDark} />
                <FeatureItem text="Export your data" isDark={isDark} />
                <FeatureItem text="No ads, ever" isDark={isDark} />
            </View>

            <View style={styles.pricing}>
                {lifetimePackage && (
                    <TouchableOpacity
                        style={[styles.priceButton, styles.lifetimeButton]}
                        onPress={() => handlePurchase(lifetimePackage)}
                        disabled={purchasing}
                    >
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>BEST VALUE</Text>
                        </View>
                        <Text style={styles.priceTitle}>Lifetime Access</Text>
                        <Text style={styles.priceAmount}>
                            {lifetimePackage.product.priceString}
                        </Text>
                        <Text style={styles.priceDescription}>One-time payment</Text>
                    </TouchableOpacity>
                )}

                {monthlyPackage && (
                    <TouchableOpacity
                        style={[styles.priceButton]}
                        onPress={() => handlePurchase(monthlyPackage)}
                        disabled={purchasing}
                    >
                        <Text style={styles.priceTitle}>Monthly</Text>
                        <Text style={styles.priceAmount}>
                            {monthlyPackage.product.priceString}
                        </Text>
                        <Text style={styles.priceDescription}>per month</Text>
                    </TouchableOpacity>
                )}
            </View>

            {purchasing && (
                <ActivityIndicator
                    size="large"
                    color={isDark ? '#fff' : '#000'}
                    style={styles.loadingIndicator}
                />
            )}

            <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={purchasing}
            >
                <Text style={[styles.restoreText, isDark && styles.textDark]}>
                    Restore Purchases
                </Text>
            </TouchableOpacity>

            {status?.isInTrial && onDismiss && (
                <TouchableOpacity style={styles.continueButton} onPress={onDismiss}>
                    <Text style={[styles.continueText, isDark && styles.textDark]}>
                        Continue with Free Trial
                    </Text>
                </TouchableOpacity>
            )}

            <Text style={[styles.disclaimer, isDark && styles.textDark]}>
                Your free trial starts when you download the app. After {status?.trialDaysRemaining || 30} days,
                you'll need to subscribe to continue using the app.
            </Text>
        </ScrollView>
    );
};

const FeatureItem: React.FC<{ text: string; isDark: boolean }> = ({ text, isDark }) => (
    <View style={styles.featureItem}>
        <Text style={[styles.checkmark, isDark && styles.textDark]}>✓</Text>
        <Text style={[styles.featureText, isDark && styles.textDark]}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    trialBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 12,
    },
    trialText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    textDark: {
        color: '#fff',
    },
    features: {
        marginBottom: 32,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkmark: {
        fontSize: 24,
        color: '#4CAF50',
        marginRight: 12,
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 16,
        color: '#000',
    },
    pricing: {
        marginBottom: 24,
    },
    priceButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
    },
    lifetimeButton: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4CAF50',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recommendedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    priceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    priceDescription: {
        fontSize: 14,
        color: '#666',
    },
    loadingIndicator: {
        marginVertical: 16,
    },
    restoreButton: {
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    restoreText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    continueButton: {
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    continueText: {
        fontSize: 16,
        color: '#666',
    },
    disclaimer: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
});
