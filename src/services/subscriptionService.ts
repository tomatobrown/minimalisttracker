import Purchases, { CustomerInfo, PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const IOS_API_KEY = Constants.expoConfig?.extra?.revenueCatIosApiKey || '';
const ANDROID_API_KEY = Constants.expoConfig?.extra?.revenueCatAndroidApiKey || '';
const FIRST_LAUNCH_KEY = '@eod_first_launch_date';
const TRIAL_DAYS = 30;

export interface SubscriptionStatus {
    isSubscribed: boolean;
    isLifetime: boolean;
    isMonthly: boolean;
    isInTrial: boolean;
    trialDaysRemaining: number;
    expirationDate?: string;
}

class SubscriptionService {
    private initialized = false;

    async initialize() {
        if (this.initialized) return;

        try {
            // Configure RevenueCat with platform-specific API keys
            Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

            if (Platform.OS === 'ios') {
                Purchases.configure({ apiKey: IOS_API_KEY });
            } else if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: ANDROID_API_KEY });
            }

            // Record first launch date for trial tracking
            const firstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
            if (!firstLaunch) {
                await AsyncStorage.setItem(FIRST_LAUNCH_KEY, new Date().toISOString());
            }

            this.initialized = true;
            console.log('Subscription service initialized');
        } catch (error) {
            console.error('Error initializing subscription service:', error);
        }
    }

    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        try {
            // Get customer info from RevenueCat
            const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();

            // Check for active entitlements
            const hasLifetime = customerInfo.entitlements.active['lifetime'] !== undefined;
            const hasMonthly = customerInfo.entitlements.active['monthly'] !== undefined;
            const isSubscribed = hasLifetime || hasMonthly;

            // Calculate trial status
            const firstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
            const trialInfo = this.calculateTrialStatus(firstLaunch);

            return {
                isSubscribed,
                isLifetime: hasLifetime,
                isMonthly: hasMonthly,
                isInTrial: trialInfo.isInTrial,
                trialDaysRemaining: trialInfo.daysRemaining,
                expirationDate: hasMonthly
                    ? customerInfo.entitlements.active['monthly']?.expirationDate
                    : undefined,
            };
        } catch (error) {
            console.error('Error getting subscription status:', error);

            // Fallback: check trial status without RevenueCat
            const firstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
            const trialInfo = this.calculateTrialStatus(firstLaunch);

            return {
                isSubscribed: false,
                isLifetime: false,
                isMonthly: false,
                isInTrial: trialInfo.isInTrial,
                trialDaysRemaining: trialInfo.daysRemaining,
            };
        }
    }

    private calculateTrialStatus(firstLaunchDate: string | null): {
        isInTrial: boolean;
        daysRemaining: number;
    } {
        if (!firstLaunchDate) {
            return { isInTrial: true, daysRemaining: TRIAL_DAYS };
        }

        const firstLaunch = new Date(firstLaunchDate);
        const now = new Date();
        const daysSinceFirstLaunch = Math.floor(
            (now.getTime() - firstLaunch.getTime()) / (1000 * 60 * 60 * 24)
        );

        const daysRemaining = Math.max(0, TRIAL_DAYS - daysSinceFirstLaunch);
        const isInTrial = daysRemaining > 0;

        return { isInTrial, daysRemaining };
    }

    async hasAccess(): Promise<boolean> {
        const status = await this.getSubscriptionStatus();
        return status.isSubscribed || status.isInTrial;
    }

    async getOfferings(): Promise<PurchasesPackage[]> {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
                return offerings.current.availablePackages;
            }
            return [];
        } catch (error) {
            console.error('Error getting offerings:', error);
            return [];
        }
    }

    async purchasePackage(pkg: PurchasesPackage): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            const hasAccess =
                customerInfo.entitlements.active['lifetime'] !== undefined ||
                customerInfo.entitlements.active['monthly'] !== undefined;

            return { success: hasAccess };
        } catch (error: any) {
            if (error.userCancelled) {
                return { success: false, error: 'Purchase cancelled' };
            }
            console.error('Purchase error:', error);
            return { success: false, error: error.message || 'Purchase failed' };
        }
    }

    async restorePurchases(): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const customerInfo = await Purchases.restorePurchases();
            const hasAccess =
                customerInfo.entitlements.active['lifetime'] !== undefined ||
                customerInfo.entitlements.active['monthly'] !== undefined;

            return {
                success: true,
                error: hasAccess ? undefined : 'No previous purchases found'
            };
        } catch (error: any) {
            console.error('Restore error:', error);
            return { success: false, error: error.message || 'Restore failed' };
        }
    }
}

export const subscriptionService = new SubscriptionService();
