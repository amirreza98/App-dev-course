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
