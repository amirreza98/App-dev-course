// Planner for the AI Calendar.
// Idea: people who procrastinate need the work split into small sessions
// that start NOW and finish a day BEFORE the deadline (buffer day).

const SESSION_HOURS = 1.5; // max length of one work session
const toDateStr = (d) => d.toISOString().slice(0, 10);

/**
 * Rule-based planner (works without any API key).
 * Returns { source, days: { 'YYYY-MM-DD': [{ taskId, title, hours }] }, atRisk: [...] }
 */
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function ruleBasedPlan(tasks, { maxHoursPerDay = 4, today: todayStr } = {}) {
  const days = {};
  const atRisk = [];
  const used = {}; // hours already booked per day

  // "today" comes from the browser so the user's time zone is respected
  const today = new Date((todayStr || toDateStr(new Date())) + 'T00:00:00Z');

  // Earliest deadline first; on the same deadline, higher priority first
  const sorted = [...tasks].sort(
    (a, b) =>
      a.deadline.localeCompare(b.deadline) ||
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
  );

  // Book up to `limit` hours of a task on one day, in sessions of max SESSION_HOURS
  const book = (task, key, limit) => {
    const total = Math.min(limit, maxHoursPerDay - (used[key] || 0));
    if (total <= 0) return 0;
    // Split into equal sessions, e.g. 2h -> 1h + 1h (not 1.5h + 0.5h)
    const count = Math.ceil(total / SESSION_HOURS);
    const base = Math.floor((total / count) * 4) / 4; // round to 15 min
    for (let i = 0; i < count; i++) {
      const hours = i === count - 1 ? total - base * (count - 1) : base; // last one takes the rest
      (days[key] ||= []).push({ taskId: task.id, title: task.title, hours });
    }
    used[key] = (used[key] || 0) + total;
    return total;
  };

  for (const task of sorted) {
    let remaining = task.hours;

    // All days we can work on it: today ... the day before the deadline (1 buffer day)
    const workDays = [];
    const lastWorkDay = new Date(task.deadline + 'T00:00:00Z');
    lastWorkDay.setUTCDate(lastWorkDay.getUTCDate() - 1);
    for (let d = new Date(today); d <= lastWorkDay; d.setUTCDate(d.getUTCDate() + 1)) {
      workDays.push(toDateStr(d));
    }

    // Pass 1: spread evenly -> a little bit every day (at least 1h, rounded up to 0.5h)
    const perDay = Math.max(1, Math.ceil((remaining / workDays.length) * 2) / 2);
    for (const key of workDays) {
      if (remaining <= 0) break;
      remaining -= book(task, key, Math.min(perDay, remaining));
    }

    // Pass 2: if some days were full, use any free time left (earliest first)
    for (const key of workDays) {
      if (remaining <= 0) break;
      remaining -= book(task, key, remaining);
    }

    if (remaining > 0) {
      atRisk.push({ taskId: task.id, title: task.title, missingHours: remaining });
    }
  }

  return { source: 'rule-based', days, atRisk };
}

/**
 * Optional: ask an LLM to build the plan. Falls back to rules on any problem.
 * Class exercise: improve the prompt, or add user preferences (e.g. "no work on Sundays").
 */
async function llmPlan(tasks, { maxHoursPerDay, today: todayStr }) {
  const today = todayStr || toDateStr(new Date());
  const prompt = `Today is ${today}. Plan these tasks for a person who procrastinates.
Rules: start today, sessions of max ${SESSION_HOURS}h, max ${maxHoursPerDay}h per day,
finish each task at least one day before its deadline, prefer high-priority tasks.
Tasks: ${JSON.stringify(tasks.map(({ id, title, deadline, hours, priority }) => ({ id, title, deadline, hours, priority })))}
Reply ONLY with JSON: {"days": {"YYYY-MM-DD": [{"taskId": number, "title": string, "hours": number}]}, "atRisk": [{"taskId": number, "title": string, "missingHours": number}]}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return { source: 'ai', days: parsed.days || {}, atRisk: parsed.atRisk || [] };
}

// useAi: only call the LLM when the user explicitly asks (it's slower and costs money)
export async function planTasks(tasks, options) {
  if (options.useAi && process.env.OPENAI_API_KEY) {
    try {
      return await llmPlan(tasks, options);
    } catch (err) {
      console.warn('LLM planning failed, using rule-based planner:', err.message);
    }
  }
  return ruleBasedPlan(tasks, options);
}
