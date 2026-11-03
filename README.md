# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~45 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) | `step-4-planner` | ~50 min |
| [5 · Database](https://github.com/amirreza98/App-dev-course/tree/step-5-database#readme) | `step-5-database` | ~60 min |
| [6 · Login](https://github.com/amirreza98/App-dev-course/tree/step-6-auth#readme) | `step-6-auth` | ~70 min |
| [7 · Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme) | `step-7-deploy` | ~75 min |
| [8 · Mobile app](https://github.com/amirreza98/App-dev-course/tree/step-8-mobile#readme) | `step-8-mobile` | ~3 h |
| [9 · Reminders](https://github.com/amirreza98/App-dev-course/tree/step-9-reminders#readme) **📍 you are here** | `step-9-reminders` | ~60 min |
| [10 · Campus 3D + VR](https://github.com/amirreza98/App-dev-course/tree/step-10-campus-3d#readme) | `step-10-campus-3d` | ~90 min |

**How it works:** this page is the tutorial for this step. Follow it from top to bottom: create, replace or delete exactly the files it tells you → **save** → look at the browser. **Lesson 0 starts from an empty folder**, and every lesson continues in your own code – reading the lessons in order is all you need. The branch holds the **finished code** of the step, so you can compare or catch up.

<details>
<summary><b>🆘 Fell behind? Get the finished code of any step</b></summary>

You need **Node.js** (LTS, 20.19 or newer): https://nodejs.org

```bash
git clone https://github.com/amirreza98/App-dev-course.git
cd App-dev-course
git checkout -f <branch>     # e.g. step-2-backend
npm install
npm run dev
```

Open **http://localhost:5173**. Stop the app with **Control + C**. From step 5 on, you also need your own `server/.env` (see Lessons 5 and 6).
</details>

---

# Lesson 9 – Reminders: the plan comes to you

| | |
|---|---|
| ⏱️ Time | ~60 min |
| 🏁 Start from | your code from Lesson 8 (or `git checkout -f step-8-mobile`) |
| ✅ Finished result | branch `step-9-reminders` |
| 🎯 You will | send **notifications** to the phone: every morning *"📚 Today: 2.5h of work"*, and the evening before a deadline *"⏰ Tomorrow: Thesis is due"* |

> 🆘 **Stuck or behind?** Run `git checkout -f step-9-reminders`, then `cd mobile && npm install` and `npx expo start`.

---

## 💡 Why reminders?

Back to the problem from the Planning phase: people who procrastinate **don't open** their calendar. A perfect plan that nobody looks at doesn't help. So the plan has to come **to them** – as a notification on the lock screen.

| | Local notification (we use this) | Push notification |
|---|---|---|
| Who sends it? | the phone itself, at a time we set | a server, over the internet |
| Needs a server? | no | yes (+ Apple/Google setup) |
| Works in Expo Go? | ✅ yes | ❌ not on Android |
| Good for | reminders at known times | chat messages, news |

Our plan is known in advance, so **local** notifications are perfect: the app asks the phone *"show this on Tuesday at 8:00"*, and the phone does it – even when the app is closed.

**The idea:** every time the plan changes, we **delete all scheduled reminders and create new ones** from the plan. Simple, and never out of date.

---

# Part Z – Reminders

## Z1. Install the notifications library

In the root folder of the project:

```bash
cd mobile
npx expo install expo-notifications
```

<details>
<summary>✅ <b>Checkpoint:</b> your <code>mobile/package.json</code> should now look like this</summary>

Your version numbers may be a little different – that's fine.

```json
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "expo": "~58.0.22",
    "expo-notifications": "~58.1.7",
    "expo-secure-store": "~58.0.2",
    "expo-status-bar": "~58.0.4",
    "react": "19.3.0",
    "react-native": "0.88.1",
    "react-native-maps": "1.29.11",
    "react-native-safe-area-context": "~5.10.1"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest"
  },
  "private": true,
  "devDependencies": {
    "@testing-library/react-native": "^14.1.0",
    "jest": "^30.5.2",
    "jest-expo": "~58.0.13",
    "test-renderer": "^1.3.1",
    "undici": "^8.12.3"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```
</details>

## Z2. ✍️ The reminders module

Create **`mobile/src/reminders.js`**:

```js
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
```

It has three parts:

1. **Settings** (on/off, which hour) – saved on the phone with SecureStore, as JSON text
2. **`buildReminders(plan, tasks)`** – a **pure function**: it only calculates the list of reminders, it doesn't touch the phone. Pure functions are easy to test (Z5).
   - every day with work sessions → one reminder at 8:00 with the hours added up per task
   - every open task → one reminder at 18:00 the evening before its deadline
   - only the next 7 days, nothing in the past, sorted by time
3. **Talking to the phone**
   - `askPermission()` – the phone asks the user *"Allow notifications?"*. Android also needs a **channel** (a category of notifications the user can turn off in Settings).
   - `syncReminders()` – `cancelAllScheduledNotificationsAsync()`, then `scheduleNotificationAsync()` for each reminder, with a **DATE trigger** (*"show it at this date"*)
   - `sendTestReminder()` – `trigger: null` means *"now"*

## Z3. ✍️ Show reminders while the app is open

By default, the phone doesn't show a banner while you are **inside** the app. Replace **`mobile/App.js`** with (new: the `Notifications.setNotificationHandler(...)` block at the top):

```js
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { api, getToken, setOnLogout, setToken } from './src/api';
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { colors } from './src/theme';

// Show reminders as a banner even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TABS = {
  map: { label: '🗺️ 3D Map', component: MapScreen },
  calendar: { label: '📅 Calendar', component: CalendarScreen },
};

export default function App() {
  const [user, setUser] = useState(null);       // null = not logged in
  const [checking, setChecking] = useState(true); // looking for a saved token
  const [tab, setTab] = useState('map');

  useEffect(() => {
    setOnLogout(() => setUser(null)); // api.js calls this when the token expired

    // App opened: is there a saved token? Then ask the server who we are.
    getToken()
      .then((token) => token && api('/auth/me').then(setUser))
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async ({ token, user }) => {
    await setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
    setTab('map');
  };

  let content;
  if (checking) {
    content = <ActivityIndicator style={{ flex: 1 }} size="large" />;
  } else if (!user) {
    content = <LoginScreen onLogin={login} />;
  } else {
    const Screen = TABS[tab].component;
    content = (
      <>
        <View style={styles.header}>
          <Text style={styles.headerText} numberOfLines={1}>{user.email}</Text>
          <Pressable onPress={logout}><Text style={styles.logout}>Log out</Text></Pressable>
        </View>
        <View style={{ flex: 1 }}>
          <Screen />
        </View>
        <View style={styles.tabBar}>
          {Object.entries(TABS).map(([key, { label }]) => (
            <Pressable key={key} style={styles.tab} onPress={() => setTab(key)}>
              <Text style={[styles.tabText, tab === key && styles.tabActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>{content}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 10 },
  headerText: { color: '#cfd8e3', flex: 1 },
  logout: { color: '#fff', fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 15, color: colors.muted },
  tabActive: { color: colors.navy, fontWeight: '700' },
});
```

## Z4. ✍️ The switch on the calendar screen

Replace **`mobile/src/screens/CalendarScreen.js`** with:

```js
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { addDays, formatLong, relative, todayYMD } from '../utils/dates';
import { askPermission, loadSettings, saveSettings, sendTestReminder, syncReminders } from '../reminders';
import { colors, ui } from '../theme';

const PRIORITIES = ['low', 'medium', 'high'];
const QUICK_DEADLINES = [3, 7, 14, 30]; // "in X days" buttons instead of a date picker
const REMINDER_HOURS = [7, 8, 9, 10];

const emptyForm = () => ({ title: '', hours: '3', deadline: addDays(todayYMD(), 7), priority: 'medium' });

export default function CalendarScreen() {
  const [tasks, setTasks] = useState([]);
  const [plan, setPlan] = useState({ days: {}, atRisk: [] });
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);
  const [reminders, setReminders] = useState(null); // settings, e.g. { enabled: true, hour: 8 }
  const [scheduled, setScheduled] = useState(0);    // how many reminders are waiting

  // Load tasks + plan from the same API as the website
  const load = useCallback(async () => {
    const [list, newPlan] = await Promise.all([
      api('/tasks'),
      api('/tasks/plan', { method: 'POST', body: { maxHoursPerDay: 4, today: todayYMD() } }),
    ]);
    setTasks(list);
    setPlan(newPlan);
  }, []);

  useEffect(() => {
    load().catch((err) => Alert.alert('Error', err.message));
  }, [load]);

  // Reminders: load the saved settings once ...
  useEffect(() => {
    loadSettings().then(setReminders);
  }, []);

  // ... and re-schedule them whenever the plan or the settings change
  useEffect(() => {
    if (!reminders) return;
    syncReminders(plan, tasks, reminders).then(setScheduled).catch(console.warn);
  }, [plan, tasks, reminders]);

  const updateReminders = async (changes) => {
    const next = { ...reminders, ...changes };
    if (changes.enabled && !(await askPermission())) {
      return Alert.alert('Notifications are off', 'Allow notifications for Expo Go in your phone settings.');
    }
    setReminders(next);
    await saveSettings(next);
  };

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  // ---- Task actions (after each change: load again, so the plan updates) ----
  const addTask = async () => {
    if (!form.title.trim()) return Alert.alert('Please enter a title');
    try {
      await api('/tasks', { method: 'POST', body: { ...form, hours: Number(form.hours) || 1 } });
      setForm(emptyForm());
      await load();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const toggleDone = async (task) => {
    await api(`/tasks/${task.id}`, { method: 'PATCH', body: { done: !task.done } });
    await load();
  };

  const removeTask = (task) => {
    Alert.alert('Delete task?', task.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api(`/tasks/${task.id}`, { method: 'DELETE' }); await load(); } },
    ]);
  };

  // ---- Agenda: every day that has work sessions or deadlines, sorted ----
  const agenda = {};
  for (const [day, sessions] of Object.entries(plan.days)) {
    agenda[day] = sessions.map((s, i) => ({ key: `s${s.taskId}-${i}`, text: `📖 ${s.title}`, hours: s.hours }));
  }
  for (const t of tasks.filter((t) => !t.done)) {
    (agenda[t.deadline] ||= []).push({ key: `d${t.id}`, text: `🏁 ${t.title} is due`, color: t.color });
  }
  const days = Object.keys(agenda).filter((d) => d >= todayYMD()).sort().slice(0, 14);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={ui.title}>AI Calendar</Text>
      <Text style={[ui.hint, { marginBottom: 12 }]}>Add a task – your work gets spread out before the deadline.</Text>

      {/* ---- New task ---- */}
      <View style={[ui.card, { gap: 10 }]}>
        <TextInput
          style={ui.input}
          placeholder="What do you need to do?"
          value={form.title}
          onChangeText={(title) => setForm({ ...form, title })}
        />
        <View style={styles.row}>
          <Text style={ui.label}>Hours</Text>
          <TextInput
            style={[ui.input, { width: 70 }]}
            keyboardType="numeric"
            value={form.hours}
            onChangeText={(hours) => setForm({ ...form, hours })}
          />
          <Text style={[ui.hint, { flex: 1, textAlign: 'right' }]}>Due {formatLong(form.deadline)}</Text>
        </View>
        <View style={styles.row}>
          {QUICK_DEADLINES.map((n) => {
            const active = form.deadline === addDays(todayYMD(), n);
            return (
              <Pressable key={n} style={[ui.chip, active && ui.chipActive]} onPress={() => setForm({ ...form, deadline: addDays(todayYMD(), n) })}>
                <Text style={[ui.chipText, active && ui.chipTextActive]}>{n} days</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.row}>
          {PRIORITIES.map((p) => (
            <Pressable key={p} style={[ui.chip, form.priority === p && ui.chipActive]} onPress={() => setForm({ ...form, priority: p })}>
              <Text style={[ui.chipText, form.priority === p && ui.chipTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={ui.button} onPress={addTask}>
          <Text style={ui.buttonText}>+ Add task</Text>
        </Pressable>
      </View>

      {/* ---- Reminders ---- */}
      {reminders && (
        <View style={[ui.card, { gap: 10 }]}>
          <View style={styles.row}>
            <Text style={{ flex: 1, fontWeight: '600', fontSize: 16 }}>🔔 Daily reminders</Text>
            <Switch
              accessibilityLabel="Daily reminders"
              value={reminders.enabled}
              onValueChange={(enabled) => updateReminders({ enabled })}
            />
          </View>
          {reminders.enabled && (
            <>
              <View style={styles.row}>
                <Text style={ui.label}>Every morning at</Text>
                {REMINDER_HOURS.map((h) => (
                  <Pressable key={h} style={[ui.chip, reminders.hour === h && ui.chipActive]} onPress={() => updateReminders({ hour: h })}>
                    <Text style={[ui.chipText, reminders.hour === h && ui.chipTextActive]}>{h}:00</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={ui.hint}>{scheduled} reminders planned for the next 7 days</Text>
              <Pressable onPress={sendTestReminder}>
                <Text style={[ui.chipText, { textDecorationLine: 'underline' }]}>Send a test reminder now</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* ---- At-risk warning ---- */}
      {plan.atRisk.length > 0 && (
        <View style={[ui.card, { backgroundColor: colors.warnBg }]}>
          <Text style={{ fontWeight: '600' }}>⚠️ Not enough time before the deadline:</Text>
          {plan.atRisk.map((r) => (
            <Text key={r.taskId}>• {r.title}: {r.missingHours}h missing</Text>
          ))}
        </View>
      )}

      {/* ---- Agenda ---- */}
      <Text style={styles.heading}>Your plan</Text>
      {days.length === 0 && <Text style={ui.hint}>Nothing planned yet.</Text>}
      {days.map((day) => (
        <View key={day} style={ui.card}>
          <Text style={styles.day}>{formatLong(day)} · {relative(day)}</Text>
          {agenda[day].map((item) => (
            <View key={item.key} style={styles.item}>
              <Text style={[styles.itemText, item.color && { color: item.color, fontWeight: '600' }]}>{item.text}</Text>
              {item.hours ? <Text style={ui.hint}>{item.hours}h</Text> : null}
            </View>
          ))}
        </View>
      ))}

      {/* ---- All tasks ---- */}
      <Text style={styles.heading}>Tasks</Text>
      {tasks.length === 0 && <Text style={ui.hint}>No tasks yet.</Text>}
      {tasks.map((t) => (
        <View key={t.id} style={[ui.card, styles.task, t.done && { opacity: 0.5 }]}>
          <Pressable onPress={() => toggleDone(t)} style={[styles.check, t.done && { backgroundColor: colors.navy }]}>
            {t.done ? <Text style={{ color: '#fff' }}>✓</Text> : null}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, t.done && { textDecorationLine: 'line-through' }]}>{t.title}</Text>
            <Text style={ui.hint}>{t.hours}h · {t.priority} · due {relative(t.deadline)}</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: t.color }]} />
          <Pressable onPress={() => removeTask(t)} hitSlop={10}>
            <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heading: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
  day: { fontWeight: '700', marginBottom: 6 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemText: { flex: 1 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontWeight: '600', fontSize: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
```

What's new:

- two states: `reminders` (the settings) and `scheduled` (how many are waiting)
- **a second `useEffect` with `[plan, tasks, reminders]`**: whenever the plan, the tasks or the settings change, we sync the reminders again. You add a task → new plan → new reminders, automatically.
- `updateReminders` – turning the switch **on** first asks for permission
- a new card: **🔔 Daily reminders** with a `<Switch>`, the hour (7–10), the count, and a **test** link

**📱 Test it:**

1. **Calendar** tab → turn on **🔔 Daily reminders** → allow notifications.
2. You see *"5 reminders planned for the next 7 days"* (your number depends on your tasks).
3. Tap **Send a test reminder now** → a banner appears at the top. 🎉
4. Add a task due in 3 days → the number goes up.
5. Tomorrow morning at 8:00, check your lock screen. 😉


## Z5. ✍️ Test the rules

Create **`mobile/__tests__/reminders.test.js`**:

```js
// Unit tests for buildReminders – no phone, no server needed.
import { buildReminders } from '../src/reminders';

jest.mock('expo-notifications', () => ({}));
jest.mock('expo-secure-store', () => ({}));

// "Now" = Monday 2 Nov 2026, 07:00 in the morning
const NOW = new Date(2026, 10, 2, 7, 0);

const plan = {
  days: {
    '2026-11-02': [{ taskId: 1, title: 'Thesis', hours: 1.5 }, { taskId: 2, title: 'Exam prep', hours: 1 }],
    '2026-11-03': [{ taskId: 1, title: 'Thesis', hours: 1 }, { taskId: 1, title: 'Thesis', hours: 1 }],
    '2026-11-20': [{ taskId: 3, title: 'Far away', hours: 1 }],
  },
};
const tasks = [
  { id: 1, title: 'Thesis', deadline: '2026-11-05', done: false },
  { id: 2, title: 'Exam prep', deadline: '2026-11-04', done: true },
];

test('one morning reminder per day with work, with the hours added up', () => {
  const list = buildReminders(plan, tasks, { hour: 8, now: NOW });
  const work = list.filter((r) => r.id.startsWith('work-'));
  expect(work.map((r) => r.id)).toEqual(['work-2026-11-02', 'work-2026-11-03']);
  expect(work[0].title).toBe('📚 Today: 2.5h of work');
  expect(work[0].body).toBe('Thesis 1.5h · Exam prep 1h');
  expect(work[1].body).toBe('Thesis 2h'); // two sessions of the same task -> added up
  expect(work[0].date.getHours()).toBe(8);
});

test('no reminder for a time that is already over', () => {
  const list = buildReminders(plan, tasks, { hour: 6, now: NOW }); // 6:00 < 7:00
  expect(list.some((r) => r.id === 'work-2026-11-02')).toBe(false);
});

test('reminder the evening before a deadline, but not for done tasks', () => {
  const list = buildReminders(plan, tasks, { now: NOW });
  const due = list.filter((r) => r.id.startsWith('due-'));
  expect(due.map((r) => r.id)).toEqual(['due-1']);           // task 2 is done
  expect(due[0].date).toEqual(new Date(2026, 10, 4, 18, 0)); // day before, 18:00
});

test('only the next 7 days, sorted by time', () => {
  const list = buildReminders(plan, tasks, { now: NOW });
  expect(list.some((r) => r.id === 'work-2026-11-20')).toBe(false);
  const times = list.map((r) => r.date.getTime());
  expect(times).toEqual([...times].sort((a, b) => a - b));
});
```

We pass a fixed **`now`** (Monday 7:00), so the test gives the same result on every day of the year.

Replace **`mobile/__tests__/app.test.js`** with (new: a fake `expo-notifications` that remembers what was scheduled, and step 4 that turns on the switch):

```js
// Screen tests: render the real App and use it like a user would.
// The app talks to a REAL server – start it first with `npm run dev` in the root folder.
//   cd mobile && npm test
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetch as realFetch } from 'undici';
import App from '../App';

// The React Native test setup replaces fetch with a fake. We want REAL requests to our server.
global.fetch = realFetch;

const API = process.env.TEST_API_URL || 'http://localhost:3001';

// Point the app at the local server instead of the live one
jest.mock('../src/config', () => ({ API_URL: process.env.TEST_API_URL || 'http://localhost:3001' }));

// SecureStore needs a real phone – in tests we keep the token in memory
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    getItemAsync: async (k) => store[k] ?? null,
    setItemAsync: async (k, v) => { store[k] = v; },
    deleteItemAsync: async (k) => { delete store[k]; },
  };
});

// Notifications need a real phone – remember what the app schedules
const mockScheduled = [];
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  requestPermissionsAsync: async () => ({ granted: true }),
  cancelAllScheduledNotificationsAsync: async () => { mockScheduled.length = 0; },
  scheduleNotificationAsync: async (request) => { mockScheduled.push(request); },
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

// Safe-area sizes come from the phone – use the library's test version
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Maps need a real phone too – replace them with simple views
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ animateCamera: jest.fn() }));
    return <View testID="map">{props.children}</View>;
  });
  const Marker = ({ title }) => <Text>marker:{title}</Text>;
  return { __esModule: true, default: MapView, Marker };
});

jest.setTimeout(30000);

beforeAll(async () => {
  const res = await fetch(`${API}/api/health`).catch(() => null);
  if (!res?.ok) throw new Error(`Start the server first (npm run dev in the root folder). No answer from ${API}`);
});

test('register, see the 3D map with the welcome place, add a task', async () => {
  const email = `phone-${Date.now()}@test.de`;
  await render(<App />);

  // 1. Login screen -> switch to "create account"
  await fireEvent.press(await screen.findByText('Create one'));
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), email);
  await fireEvent.changeText(screen.getByPlaceholderText('at least 6 characters'), 'secret123');
  await fireEvent.press(screen.getByText('Create account'));

  // 2. Logged in: email in the header, map tab with the welcome place
  expect(await screen.findByText(email)).toBeTruthy();
  expect(screen.getByTestId('map')).toBeTruthy();
  expect(await screen.findByText('marker:Brandenburg Gate')).toBeTruthy();

  // 3. Calendar tab: add a task -> it shows up in the task list and in the plan
  await fireEvent.press(screen.getByText('📅 Calendar'));
  await fireEvent.changeText(await screen.findByPlaceholderText('What do you need to do?'), 'Phone task');
  await fireEvent.press(screen.getByText('+ Add task'));
  await waitFor(() => expect(screen.getAllByText(/Phone task/).length).toBeGreaterThan(1));
  expect(screen.getAllByText('📖 Phone task').length).toBeGreaterThan(0); // work sessions

  // 4. Turn on reminders -> the phone gets one notification per working day (+ deadline eve)
  await fireEvent(screen.getByLabelText('Daily reminders'), 'valueChange', true);
  expect(await screen.findByText(/reminders planned for the next 7 days/)).toBeTruthy();
  await waitFor(() => expect(mockScheduled.length).toBeGreaterThan(0));
  expect(mockScheduled[0].content.title).toMatch(/Today: .*h of work/);

  // 5. Log out -> back to the login screen
  await fireEvent.press(screen.getByText('Log out'));
  expect(await screen.findByText('👋 Welcome back')).toBeTruthy();
});

test('wrong password shows the server message', async () => {
  await render(<App />);
  await fireEvent.changeText(await screen.findByPlaceholderText('you@example.com'), 'nobody@test.de');
  await fireEvent.changeText(screen.getByPlaceholderText('at least 6 characters'), 'wrong-password');
  await fireEvent.press(screen.getByText('Log in'));
  expect(await screen.findByText('Wrong email or password')).toBeTruthy();
});
```

Run (local server running in another terminal: `npm run dev` in the root folder):

```bash
npm test
```

👀 **You see:** `Tests: 6 passed`.

---

# 🎉 Your app reminds you!

## 🛠️ Troubleshooting

| You see | Fix |
|---|---|
| No permission popup on Android | Android shows it only once – check **Settings → Apps → Expo Go → Notifications** |
| Switch turns off again with *"Notifications are off"* | you said *Don't allow* – allow notifications for **Expo Go** in your phone settings |
| Test reminder works, morning reminder doesn't come | iPhone *Focus / Do Not Disturb*? Android battery saver can delay reminders by a few minutes |
| `0 reminders planned` | no work sessions in the next 7 days – add a task |

## 💪 Bonus exercises

**A.** Add the evening hour to the settings (`DEADLINE_HOUR`), with chips like the morning hour.

**B.** No reminders at the weekend: in `buildReminders`, skip days where `fromYMD(day).getDay()` is `0` (Sunday) or `6` (Saturday).

**C.** Tapping the reminder should open the **Calendar** tab. *(Hint: `Notifications.addNotificationResponseReceivedListener` in `App.js` → `setTab('calendar')`.)*

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Local notification** | a message the phone shows at a time the app scheduled |
| **Push notification** | a message a server sends to the phone over the internet |
| **Trigger** | *when* a notification appears (`DATE` = at a date, `null` = now) |
| **Permission** | the user must allow notifications once |
| **Notification channel** | Android's category for notifications (user can turn each one off) |
| **Pure function** | only calculates a result from its inputs, changes nothing – easy to test |

---

➡️ **Next:** [Lesson 10 – Campus 3D](10-campus-3d.md): walk through your campus in 3D, and in VR.
