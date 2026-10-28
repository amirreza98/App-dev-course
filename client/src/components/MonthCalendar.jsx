import { monthGrid, todayYMD } from '../utils/dates.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CHIPS = 3;

/**
 * Month view.
 * events: { 'YYYY-MM-DD': [{ key, label, color, done }] }
 */
export default function MonthCalendar({ month, onMonthChange, events, selected, onSelect }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const today = todayYMD();
  const cells = monthGrid(year, m);

  const shift = (n) => onMonthChange(new Date(year, m + n, 1));
  const title = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="cal">
      <div className="cal-header">
        <button onClick={() => shift(-1)}>‹</button>
        <h3>{title}</h3>
        <button onClick={() => shift(1)}>›</button>
        <button className="ghost" onClick={() => { onMonthChange(new Date()); onSelect(today); }}>
          Today
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}

        {cells.map(({ ymd, day, inMonth }) => {
          const list = events[ymd] || [];
          const classes = [
            'cal-cell',
            !inMonth && 'muted',
            ymd < today && 'past',
            ymd === today && 'today',
            ymd === selected && 'selected',
          ].filter(Boolean).join(' ');

          return (
            <div key={ymd} className={classes} onClick={() => onSelect(ymd)}>
              <div className="cal-day">
                <span>{day}</span>
              </div>
              {list.slice(0, MAX_CHIPS).map((e) => (
                <div
                  key={e.key}
                  className={`chip deadline ${e.done ? 'done' : ''}`}
                  style={{ background: e.color }}
                  title={e.label}
                >
                  🏁 {e.label}
                </div>
              ))}
              {list.length > MAX_CHIPS && <div className="chip more">+{list.length - MAX_CHIPS} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
