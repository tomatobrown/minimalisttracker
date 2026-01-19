import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SubscriptionGate } from '@/src/components/SubscriptionGate';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SubscriptionGate>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="explore"
          options={{
            // Hide the Explore route from the tab bar and deep links
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Daily Check-in',
            headerShown: true,
            headerTitle: 'End of Day',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="challenge"
          options={{
            title: 'Challenge',
            headerTitle: 'Monthly Challenge',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="flag.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="trends"
          options={{
            title: 'Trends',
            headerTitle: 'Trends & Statistics',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerTitle: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          }}
        />
      </Tabs>
    </SubscriptionGate>
  );
}
