// Screen tests: render the real App and use it like a user would.
// The app talks to a REAL server – start it first with `npm run dev` in the root folder.
//   cd mobile && npm test
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { fetch as realFetch } from 'undici';
import App from '../App';

// The React Native test setup replaces fetch with a fake. We want REAL requests to our server.
global.fetch = realFetch;

const API = process.env.TEST_API_URL || 'http://localhost:3001';

// Point the app at the local server instead of the live one
jest.mock('../src/config', () => ({ API_URL: process.env.TEST_API_URL || 'http://localhost:3001' }));

// SecureStore needs a real phone – in tests we keep the token in memory
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    getItemAsync: async (k) => store[k] ?? null,
    setItemAsync: async (k, v) => { store[k] = v; },
    deleteItemAsync: async (k) => { delete store[k]; },
  };
});

// Safe-area sizes come from the phone – use the library's test version
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Maps need a real phone too – replace them with simple views
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const MapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ animateCamera: jest.fn() }));
    return <View testID="map">{props.children}</View>;
  });
  const Marker = ({ title }) => <Text>marker:{title}</Text>;
  return { __esModule: true, default: MapView, Marker };
});

jest.setTimeout(30000);

beforeAll(async () => {
  const res = await fetch(`${API}/api/health`).catch(() => null);
  if (!res?.ok) throw new Error(`Start the server first (npm run dev in the root folder). No answer from ${API}`);
});

test('register, see the 3D map with the welcome place, add a task', async () => {
  const email = `phone-${Date.now()}@test.de`;
  await render(<App />);

  // 1. Login screen -> switch to "create account"
  await fireEvent.press(await screen.findByText('Create one'));
  await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), email);
  await fireEvent.changeText(screen.getByPlaceholderText('at least 6 characters'), 'secret123');
  await fireEvent.press(screen.getByText('Create account'));

  // 2. Logged in: email in the header, map tab with the welcome place
  expect(await screen.findByText(email)).toBeTruthy();
  expect(screen.getByTestId('map')).toBeTruthy();
  expect(await screen.findByText('marker:Brandenburg Gate')).toBeTruthy();

  // 3. Calendar tab: add a task -> it shows up in the task list and in the plan
  await fireEvent.press(screen.getByText('📅 Calendar'));
  await fireEvent.changeText(await screen.findByPlaceholderText('What do you need to do?'), 'Phone task');
  await fireEvent.press(screen.getByText('+ Add task'));
  await waitFor(() => expect(screen.getAllByText(/Phone task/).length).toBeGreaterThan(1));
  expect(screen.getAllByText('📖 Phone task').length).toBeGreaterThan(0); // work sessions

  // 4. Log out -> back to the login screen
  await fireEvent.press(screen.getByText('Log out'));
  expect(await screen.findByText('👋 Welcome back')).toBeTruthy();
});

test('wrong password shows the server message', async () => {
  await render(<App />);
  await fireEvent.changeText(await screen.findByPlaceholderText('you@example.com'), 'nobody@test.de');
  await fireEvent.changeText(screen.getByPlaceholderText('at least 6 characters'), 'wrong-password');
  await fireEvent.press(screen.getByText('Log in'));
  expect(await screen.findByText('Wrong email or password')).toBeTruthy();
});
