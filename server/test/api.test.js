// API tests: start the real Express app and send real HTTP requests.
// Needs DATABASE_URL and JWT_SECRET (from server/.env, or from GitHub Actions).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { pool } from '../src/db.js';

let server, base;

before(async () => {
  server = app.listen(0);                                   // 0 = any free port
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await pool.end();
});

// Small helper: send a request, return { status, body }
async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

const email = (name) => `${name}-${Date.now()}@test.de`;

test('health check works', async () => {
  const res = await call('GET', '/health');
  assert.equal(res.status, 200);
});

test('tasks need a login', async () => {
  const res = await call('GET', '/tasks');
  assert.equal(res.status, 401);
});

test('register, create a task, and read it back', async () => {
  const reg = await call('POST', '/auth/register', { email: email('lena'), password: 'secret123' });
  assert.equal(reg.status, 201);
  const token = reg.body.token;

  const created = await call('POST', '/tasks', { title: 'Thesis', deadline: '2030-01-10', hours: 6 }, token);
  assert.equal(created.status, 201);

  const list = await call('GET', '/tasks', null, token);
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].title, 'Thesis');
});

test('wrong password is refused', async () => {
  const address = email('omar');
  await call('POST', '/auth/register', { email: address, password: 'secret123' });
  const res = await call('POST', '/auth/login', { email: address, password: 'nope-nope' });
  assert.equal(res.status, 401);
});

test('users only see their own tasks', async () => {
  const a = (await call('POST', '/auth/register', { email: email('a'), password: 'secret123' })).body.token;
  const b = (await call('POST', '/auth/register', { email: email('b'), password: 'secret123' })).body.token;
  const task = (await call('POST', '/tasks', { title: 'Private', deadline: '2030-01-10', hours: 2 }, a)).body;

  assert.equal((await call('GET', '/tasks', null, b)).body.length, 0);
  assert.equal((await call('PATCH', `/tasks/${task.id}`, { done: true }, b)).status, 404);
});
