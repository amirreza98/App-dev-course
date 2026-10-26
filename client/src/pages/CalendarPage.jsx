import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import MonthCalendar from '../components/MonthCalendar.jsx';
import { addDays, formatLong, fromYMD, relative, todayYMD } from '../utils/dates.js';

const emptyForm = () => ({ title: '', deadline: addDays(todayYMD(), 7), hours: 3, priority: 'medium' });

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState(() => new Date()); // which month the calendar shows
  const [selected, setSelected] = useState(todayYMD()); // which day is clicked
  const [plan, setPlan] = useState({ source: '', days: {}, atRisk: [] });
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(4); // daily work limit
  const [aiLoading, setAiLoading] = useState(false);

  // Load tasks once
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

  const fetchPlan = useCallback(
    (useAi = false) =>
      api('/tasks/plan', {
        method: 'POST',
        body: { maxHoursPerDay: Number(maxHoursPerDay), useAi, today: todayYMD() },
      }).then(setPlan),
    [maxHoursPerDay]
  );

  // Re-plan automatically whenever tasks or the daily limit change
  useEffect(() => {
    fetchPlan().catch(console.error);
  }, [tasks, fetchPlan]);

  const planWithAi = async () => {
    setAiLoading(true);
    try { await fetchPlan(true); } finally { setAiLoading(false); }
  };

  // ---- Task actions ----
  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const task = await api('/tasks', { method: 'POST', body: form });
    setTasks((prev) => [...prev, task]);
    setForm(emptyForm());
  };

  const updateTask = async (id, changes) => {
    const updated = await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const showDay = (ymd) => {
    setMonth(fromYMD(ymd));
    setSelected(ymd);
  };

  // ---- Turn tasks + plan into calendar events ----
  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);

  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    for (const [day, sessions] of Object.entries(plan.days)) {
      // Merge several sessions of the same task on one day into one entry
      const perTask = {};
      for (const s of sessions) {
        perTask[s.taskId] ||= { ...s, hours: 0, count: 0 };
        perTask[s.taskId].hours += s.hours;
        perTask[s.taskId].count += 1;
      }
      for (const s of Object.values(perTask)) {
        const t = taskById[s.taskId];
        (ev[day] ||= []).push({
          key: `s-${day}-${s.taskId}`, kind: 'session', label: `${s.title} · ${s.hours}h`,
          hours: s.hours, count: s.count, color: t?.color || '#888', task: t,
        });
      }
    }
    return ev;
  }, [tasks, plan, taskById]);

  // ---- Stats ----
  const open = tasks.filter((t) => !t.done);
  const totalHours = open.reduce((s, t) => s + t.hours, 0);
  const nextDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.deadline.localeCompare(b.deadline)
  );
  const dayEvents = events[selected] || [];

  return (
    <div className="cal-page">
      {/* ---------- Left column ---------- */}
      <section className="cal-side">
        <h2>AI Calendar</h2>
        <p className="hint">Add tasks — your work gets spread out before every deadline.</p>

        <form className="card form" onSubmit={addTask}>
          <input
            placeholder="What do you need to do?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="row">
            <label>
              Deadline
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </label>
            <label>
              Hours
              <input type="number" min="0.5" step="0.5" value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <button type="submit">+ Add task</button>
        </form>

        <div className="stats">
          <div><b>{open.length}</b><span>open tasks</span></div>
          <div><b>{totalHours}h</b><span>work left</span></div>
          <div className={plan.atRisk.length ? 'bad' : ''}><b>{plan.atRisk.length}</b><span>at risk</span></div>
        </div>
        {nextDeadline && (
          <p className="hint">Next deadline: <b>{nextDeadline.title}</b> {relative(nextDeadline.deadline)}</p>
        )}

        {plan.atRisk.length > 0 && (
          <div className="warning">
            ⚠️ Not enough time for:
            <ul>
              {plan.atRisk.map((r) => <li key={r.taskId}>{r.title} — {r.missingHours}h missing</li>)}
            </ul>
            Raise the daily limit, lower the hours, or move the deadline.
          </div>
        )}

        <div className="card plan-row">
          <label>
            Max hours / day
            <input type="number" min="1" max="12" value={maxHoursPerDay}
              onChange={(e) => setMaxHoursPerDay(e.target.value)} />
          </label>
          <button onClick={planWithAi} disabled={!open.length || aiLoading}>
            {aiLoading ? 'Thinking…' : '✨ Re-plan with AI'}
          </button>
        </div>
        {plan.source && <p className="hint">Current plan: {plan.source}</p>}

        <h3>Tasks</h3>
        {!tasks.length && <p className="hint">No tasks yet.</p>}
        <ul className="task-list">
          {sortedTasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <input type="checkbox" checked={t.done} onChange={() => updateTask(t.id, { done: !t.done })} />
              <i className="dot" style={{ background: t.color }} />
              <div className="task-info" onClick={() => showDay(t.deadline)}>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {t.hours}h · due {t.deadline} ({relative(t.deadline)})
                  <span className={`badge ${t.priority}`}>{t.priority}</span>
                </div>
              </div>
              <button className="small" onClick={() => removeTask(t.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Right column ---------- */}
      <section className="cal-main">
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          events={events}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="card day-details">
          <h3>{formatLong(selected)}</h3>
          {!dayEvents.length && <p className="hint">Nothing planned. Free day 🎉</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              {e.kind === 'deadline'
                ? <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
                : <span>Work on <b>{e.task?.title}</b> for {e.hours}h
                    {e.count > 1 && <span className="hint"> ({e.count} sessions, take a break between)</span>}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
