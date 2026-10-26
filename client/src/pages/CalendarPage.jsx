import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Today as 'YYYY-MM-DD' (the format <input type="date"> uses)
const today = () => new Date().toISOString().slice(0, 10);

export default function CalendarPage() {
  // State = data that can change. When it changes, React re-draws the page.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(today());
  const [hours, setHours] = useState(3);

  // NEW in step 2: load the tasks from the server when the page opens
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

  const addTask = async (e) => {
    e.preventDefault(); // don't reload the page
    if (!title.trim()) return;
    // NEW: send the task to the server; it answers with the saved task (incl. id)
    const task = await api('/tasks', { method: 'POST', body: { title, deadline, hours } });
    setTasks([...tasks, task]); // new array = React notices the change
    setTitle('');
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>
      <p className="hint">Step 2: tasks are saved on the server. Refresh — they stay!</p>

      <form className="card form" onSubmit={addTask}>
        <input
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="row">
          <label>
            Deadline
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <label>
            Hours
            <input type="number" min="0.5" step="0.5" value={hours}
              onChange={(e) => setHours(e.target.value)} />
          </label>
        </div>
        <button type="submit">+ Add task</button>
      </form>

      <h3>Tasks ({tasks.length})</h3>
      {!tasks.length && <p className="hint">No tasks yet.</p>}
      <ul className="task-list">
        {tasks.map((t) => (
          <li key={t.id}>
            <div className="task-info">
              <div className="task-title">{t.title}</div>
              <div className="task-meta">{t.hours}h · due {t.deadline}</div>
            </div>
            <button className="small" onClick={() => removeTask(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
