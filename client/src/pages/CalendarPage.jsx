import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import MonthCalendar from '../components/MonthCalendar.jsx';
import { addDays, formatLong, fromYMD, relative, todayYMD } from '../utils/dates.js';

const emptyForm = () => ({ title: '', deadline: addDays(todayYMD(), 7), hours: 3, priority: 'medium' });

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState(() => new Date()); // which month the calendar shows
  const [selected, setSelected] = useState(todayYMD()); // which day is clicked

  // Load tasks once
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

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

  // ---- Turn tasks into calendar events: { 'YYYY-MM-DD': [event, ...] } ----
  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    return ev;
  }, [tasks]);

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
        <p className="hint">Step 3: every deadline appears on the calendar.</p>

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
          <div><b>{tasks.length - open.length}</b><span>done</span></div>
        </div>
        {nextDeadline && (
          <p className="hint">Next deadline: <b>{nextDeadline.title}</b> {relative(nextDeadline.deadline)}</p>
        )}

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
          {!dayEvents.length && <p className="hint">No deadlines this day.</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
            </div>
          ))}
          <p className="hint">Next step: plan <i>when</i> to work on each task, so it's not all left for the last day.</p>
        </div>
      </section>
    </div>
  );
}
