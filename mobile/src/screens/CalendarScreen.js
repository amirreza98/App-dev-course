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
