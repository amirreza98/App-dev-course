// Date helpers that work with 'YYYY-MM-DD' strings in the user's LOCAL time zone.

const pad = (n) => String(n).padStart(2, '0');

export const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromYMD = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayYMD = () => toYMD(new Date());

export const addDays = (ymd, n) => {
  const d = fromYMD(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
};

export const daysBetween = (fromYmd, toYmd) =>
  Math.round((fromYMD(toYmd) - fromYMD(fromYmd)) / 86_400_000);

// All cells for a month grid, weeks starting on Monday (6 rows x 7 days)
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { ymd: toYMD(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

export const formatLong = (ymd) =>
  fromYMD(ymd).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

export const relative = (ymd) => {
  const n = daysBetween(todayYMD(), ymd);
  if (n < 0) return `${-n}d overdue`;
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  return `in ${n} days`;
};
