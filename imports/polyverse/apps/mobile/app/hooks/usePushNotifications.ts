import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotification {
  title: string;
  body: string;
  data?: {
    type: 'new_short' | 'new_claim' | 'new_comment' | 'tip_received' | 'follow' | 'upload_started' | 'upload_completed';
    targetId?: string;
    targetType?: 'short' | 'claim' | 'user';
    deepLink?: string;
    uploadId?: string;
  };
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token || '');
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      setNotification(notification);
    });

    // Listen for notification responses (user taps on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data as any;
      
      // Handle deep linking
      if (data?.deepLink) {
        router.push(data.deepLink as any);
      } else if (data?.targetType && data?.targetId) {
        // Navigate based on target type
        switch (data.targetType) {
          case 'short':
            router.push(`/shorts/${data.targetId}` as any);
            break;
          case 'claim':
            router.push(`/truth/${data.targetId}` as any);
            break;
          case 'user':
            router.push(`/profile/${data.targetId}` as any);
            break;
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  const sendLocalNotification = async (notification: PushNotification) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  };

  const scheduleReminderNotification = async (title: string, body: string, trigger: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'reminder' },
      },
      trigger: {
        date: trigger,
      },
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const getNotificationPermissions = async () => {
    const settings = await Notifications.getPermissionsAsync();
    return settings;
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  };

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    scheduleReminderNotification,
    cancelAllNotifications,
    getNotificationPermissions,
    requestNotificationPermissions,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // For now, we'll return a mock token
  // In a real app, you would implement the full registration logic
  token = 'mock-expo-push-token';

  return token;
}