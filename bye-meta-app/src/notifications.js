import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule the Sunday evening "write your entry" reminder.
 * Fires every Sunday at 18:00 local time.
 */
export async function scheduleSundayReminder() {
  await cancelSundayReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: 'sunday-reminder',
    content: {
      title: 'Time for your weekly reflection',
      body: 'Capture your 4 highlights from this week.',
    },
    trigger: {
      weekday: 1, // Sunday (1 = Sunday in Expo)
      hour: 18,
      minute: 0,
      repeats: true,
    },
  });
}

export async function cancelSundayReminder() {
  await Notifications.cancelScheduledNotificationAsync('sunday-reminder').catch(() => {});
}

/**
 * Fire a one-time "friends posted" notification.
 */
export async function notifyFriendsPosted(count) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your friends posted this week',
      body: count === 1 ? '1 friend shared their highlights.' : `${count} friends shared their highlights.`,
    },
    trigger: null, // immediate
  });
}
