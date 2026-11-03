// Unit tests: check the planner rules without a server or database.
// Run with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ruleBasedPlan } from '../src/planner.js';

const TODAY = '2026-11-02';
const task = (id, deadline, hours, priority = 'medium') => ({ id, title: `Task ${id}`, deadline, hours, priority });

// Helper: all sessions of the plan as one flat list
const sessions = (plan) => Object.entries(plan.days).flatMap(([day, list]) => list.map((s) => ({ day, ...s })));

test('plans all hours of a task', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-08', 6)], { today: TODAY });
  const total = sessions(plan).reduce((sum, s) => sum + s.hours, 0);
  assert.equal(total, 6);
  assert.deepEqual(plan.atRisk, []);
});

test('never plans work on the deadline day or later', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-05', 4)], { today: TODAY });
  for (const s of sessions(plan)) assert.ok(s.day < '2026-11-05', `session on ${s.day}`);
});

test('spreads work over several days (not everything today)', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-08', 6)], { today: TODAY });
  assert.ok(Object.keys(plan.days).length >= 3);
});

test('sessions are at most 1.5 hours', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-04', 6)], { maxHoursPerDay: 6, today: TODAY });
  for (const s of sessions(plan)) assert.ok(s.hours <= 1.5, `${s.hours}h session`);
});

test('respects the daily limit', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-06', 8), task(2, '2026-11-06', 8)], { maxHoursPerDay: 3, today: TODAY });
  for (const [day, list] of Object.entries(plan.days)) {
    const hours = list.reduce((sum, s) => sum + s.hours, 0);
    assert.ok(hours <= 3, `${hours}h on ${day}`);
  }
});

test('warns when a task does not fit', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-03', 10)], { maxHoursPerDay: 4, today: TODAY });
  assert.equal(plan.atRisk.length, 1);
  assert.equal(plan.atRisk[0].missingHours, 6);
});
