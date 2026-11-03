// Daily reminders on the phone – the plan comes to the student, not the other way round.
// These are LOCAL notifications: the phone schedules them itself, no server needed.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { addDays, fromYMD, toYMD } from './utils/dates';

const SETTINGS_KEY = 'reminders';
export const DEFAULT_SETTINGS = { enabled: false, hour: 8 };
const DEADLINE_HOUR = 18; // "due tomorrow" reminders come in the evening
const DAYS_AHEAD = 7;     // schedule one week in advance

// ---- Settings (saved on the phone) ----
export async function loadSettings() {
  const saved = await SecureStore.getItemAsync(SETTINGS_KEY);
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
}

export const saveSettings = (settings) => SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));

// ---- Which reminders should exist? A pure function: plan in, list out (easy to test) ----
export function buildReminders(plan, tasks, { hour = 8, now = new Date(), days = DAYS_AHEAD } = {}) {
  const reminders = [];
  const today = toYMD(now);
  const lastDay = addDays(today, days - 1);

  // 1. Every morning with work: "📚 Today: 2.5h of work"
  for (let i = 0; i < days; i++) {
    const day = addDays(today, i);
    const sessions = plan.days[day] || [];
    if (!sessions.length) continue;

    const at = fromYMD(day);
    at.setHours(hour, 0, 0, 0);
    if (at <= now) continue; // this morning is already over

    // Add up the hours per task: "Thesis 1.5h · Exam prep 1h"
    const perTask = {};
    for (const s of sessions) perTask[s.title] = (perTask[s.title] || 0) + s.hours;
    const total = Object.values(perTask).reduce((a, b) => a + b, 0);

    reminders.push({
      id: `work-${day}`,
      date: at,
      title: `📚 Today: ${total}h of work`,
      body: Object.entries(perTask).map(([title, h]) => `${title} ${h}h`).join(' · '),
    });
  }

  // 2. The evening before a deadline: "⏰ Tomorrow: Thesis is due"
  for (const task of tasks) {
    if (task.done) continue;
    const day = addDays(task.deadline, -1);
    const at = fromYMD(day);
    at.setHours(DEADLINE_HOUR, 0, 0, 0);
    if (at <= now || day > lastDay) continue;
    reminders.push({
      id: `due-${task.id}`,
      date: at,
      title: `⏰ Tomorrow: ${task.title} is due`,
      body: 'Last evening to finish it. You can do this! 💪',
    });
  }

  return reminders.sort((a, b) => a.date - b.date);
}

// ---- Talk to the phone ----
export async function askPermission() {
  // Android needs a "channel" for notifications (and shows the permission popup only after one exists)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

// Delete all old reminders and schedule the new ones. Returns how many were scheduled.
export async function syncReminders(plan, tasks, settings) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return 0;

  const reminders = buildReminders(plan, tasks, { hour: settings.hour });
  for (const r of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: 'reminders' },
    });
  }
  return reminders.length;
}

// Show one right now – perfect for testing
export const sendTestReminder = () =>
  Notifications.scheduleNotificationAsync({
    content: { title: '📚 Reminders work!', body: 'You will get your plan every morning.' },
    trigger: null, // null = now
  });
