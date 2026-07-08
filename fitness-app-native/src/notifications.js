import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PROGRAM, EX } from './data';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* JS getDay(): 週日0…週六6 → expo weekly trigger weekday: 週日1…週六7 */
const TRAIN_DAYS = [1, 2, 4, 5];

export async function enableWeeklyReminders(hour) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('training', {
      name: '訓練提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const g of TRAIN_DAYS) {
    const p = PROGRAM[g];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏋️ 今天練:${p.name}`,
        body: p.list.map((id, i) => `${i + 1}. ${EX[id].n}`).join('・'),
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: 'training' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: g + 1, // 0-based getDay → 1-based (Sunday=1)
        hour,
        minute: 0,
      },
    });
  }
  return true;
}

export async function disableReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
