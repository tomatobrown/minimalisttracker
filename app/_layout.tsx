import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AppSplash from '@/src/components/AppSplash';
import { initializeNotifications } from '@/src/utils/notificationScheduler';
import { subscriptionService } from '@/src/services/subscriptionService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Keep native splash visible until we mount and show our overlay
    SplashScreen.preventAutoHideAsync().catch(() => { });
  }, []);

  useEffect(() => {
    // Hide native splash shortly after mount so our overlay is visible
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => { });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Initialize notifications on app start
    initializeNotifications().catch((error) =>
      console.error('Error initializing notifications:', error)
    );

    // Initialize subscription service
    subscriptionService.initialize().catch((error) =>
      console.error('Error initializing subscription service:', error)
    );
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {showSplash && <AppSplash onFinish={() => setShowSplash(false)} />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
