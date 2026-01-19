import * as Notifications from 'expo-notifications';
import { storage } from '../storage/storage';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

export async function scheduleNotification(timeString: string): Promise<void> {
    try {
        // Cancel all existing notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Parse time string (HH:MM format, e.g., "20:30")
        const [hours, minutes] = timeString.split(':').map(Number);

        // Calculate seconds until next occurrence of the time
        const now = new Date();
        const trigger = new Date();
        trigger.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, schedule for tomorrow
        if (trigger <= now) {
            trigger.setDate(trigger.getDate() + 1);
        }

        const secondsUntilNotification = Math.floor((trigger.getTime() - now.getTime()) / 1000);

        // Schedule notification with a time interval trigger, repeating daily
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'End of Day Check-in',
                body: 'Time to enter your daily values',
                sound: true,
            },
            trigger: {
                type: 'timeInterval' as any,
                seconds: Math.max(1, secondsUntilNotification),
                repeats: true,
            },
        });

        console.log(`Notification scheduled for ${timeString}`);
    } catch (error) {
        console.error('Error scheduling notification:', error);
    }
}

export async function initializeNotifications(): Promise<void> {
    try {
        const permitted = await requestNotificationPermissions();
        if (!permitted) {
            console.warn('Notification permissions not granted');
            return;
        }

        const timeString = await storage.getNotificationTime();
        if (timeString) {
            await scheduleNotification(timeString);
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}
