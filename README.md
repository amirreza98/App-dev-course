# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~45 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) | `step-4-planner` | ~50 min |
| [5 · Database](https://github.com/amirreza98/App-dev-course/tree/step-5-database#readme) | `step-5-database` | ~60 min |
| [6 · Login](https://github.com/amirreza98/App-dev-course/tree/step-6-auth#readme) | `step-6-auth` | ~70 min |
| [7 · Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme) | `step-7-deploy` | ~75 min |
| [8 · Mobile app](https://github.com/amirreza98/App-dev-course/tree/step-8-mobile#readme) **📍 you are here** | `step-8-mobile` | ~3 h |

**How it works:** this page is the tutorial for this step. Follow it from top to bottom: create, replace or delete exactly the files it tells you → **save** → look at the browser. **Lesson 0 starts from an empty folder**, and every lesson continues in your own code – reading the lessons in order is all you need. The branch holds the **finished code** of the step, so you can compare or catch up.

<details>
<summary><b>🆘 Fell behind? Get the finished code of any step</b></summary>

You need **Node.js** (LTS, 20.19 or newer): https://nodejs.org

```bash
git clone https://github.com/amirreza98/App-dev-course.git
cd App-dev-course
git checkout -f <branch>     # e.g. step-2-backend
npm install
npm run dev
```

Open **http://localhost:5173**. Stop the app with **Control + C**. From step 5 on, you also need your own `server/.env` (see Lessons 5 and 6).
</details>

---

# Lesson 8 – The mobile app: your project on your phone

| | |
|---|---|
| ⏱️ Time | ~2 × 90 min |
| 🏁 Start from | your code from Lesson 7 – **your app must be live** (Lesson 7, Part T) |
| ✅ Finished result | branch `step-8-mobile` (folder `mobile/`) |
| 🎯 You will | build a real iPhone / Android app with **React Native**, using the **same server and database** as your website |

> 🆘 **Stuck or behind?** Run `git checkout -f step-8-mobile`, then `cd mobile && npm install`, set your link in `mobile/src/config.js` (V1) and start with `npx expo start` (U4).

---

## 💡 React → React Native: what changes, what stays

You **don't convert** the website. You build a second frontend that talks to the **same API**:

```
            ┌── Website (React, client/) ──┐
Neon ◀── Express API on Vercel ◀──────────┤
            └── Phone app (React Native, mobile/) ──┘
```

| Stays the same ✅ | Changes 🔄 |
|---|---|
| React: components, `useState`, `useEffect`, props | `<div>` → `<View>`, `<p>`/`<span>` → `<Text>` |
| The whole server, database, login, planner | `<input>` → `<TextInput>`, `<button>` → `<Pressable>` |
| `fetch` and our `api()` helper idea | CSS file → `StyleSheet.create({...})` in JavaScript |
| Date helpers (`dates.js`) | `localStorage` → `SecureStore` (encrypted phone storage) |
| | MapLibre → `react-native-maps` (Apple Maps / Google Maps, with 3D buildings) |

We use **Expo**: a toolkit that runs your app on your phone **without Xcode or Android Studio**. You install the free **Expo Go** app, scan a QR code – done.

---

# Part U – Your first app on your phone

## U1. Install Expo Go on your phone

- iPhone: **App Store** → search **Expo Go** → install
- Android: **Play Store** → search **Expo Go** → install

## U2. Create the app

In the **root** folder of the project (next to `client/` and `server/`):

```bash
npx create-expo-app@latest mobile --template blank
```

A new folder **`mobile/`** appears – a complete, separate React Native project with its own `package.json`.

> 💡 `mobile` is **not** added to the root `workspaces`: the phone app uses its own versions of React. Always run its commands **inside** `mobile/`.

## U3. Clean up and install the libraries

Delete what we don't need (if they exist): **`mobile/AGENTS.md`**, **`mobile/LICENSE`** and the folder **`mobile/.claude`**.

```bash
rm -rf mobile/AGENTS.md mobile/LICENSE mobile/.claude
```

Now install three libraries – **always with `npx expo install`** (it picks versions that fit your Expo version):

```bash
cd mobile
npx expo install react-native-maps expo-secure-store react-native-safe-area-context
```

- **react-native-maps** – the map (Apple Maps on iPhone, Google Maps on Android), works in Expo Go
- **expo-secure-store** – stores the login token encrypted on the phone
- **react-native-safe-area-context** – keeps our app away from the notch and the home bar

Replace **`mobile/app.json`** with (new: the app name):

```json
{
  "expo": {
    "name": "App Dev Course",
    "slug": "app-dev-course",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store"
    ]
  }
}
```

## U4. 📱 Start it

Still in the `mobile` folder:

```bash
npx expo start
```

A **QR code** appears in the terminal.

- **iPhone:** open the **Camera** app → point it at the QR code → tap the banner
- **Android:** open **Expo Go** → **Scan QR code**

👀 **You see:** *"Open up App.js to start working on your app!"* on your phone. Open **`mobile/App.js`**, change the text, save → the phone updates instantly – just like Vite!

> 📶 Phone and laptop must be on the **same Wi-Fi**. University Wi-Fi often blocks this – then stop with **Control + C** and run `npx expo start --tunnel` (say **yes** if it asks to install something).

---

# Part V – Log in with your real account

## V1. ✍️ Where is your server?

Create the folder **`mobile/src`** and in it **`mobile/src/config.js`**:

```js
// The address of YOUR live server from Lesson 7 – no "/" at the end.
// The phone talks to the same API, the same login and the same database as the website.
export const API_URL = 'https://app-dev-course-live.vercel.app';
```

**Change the link to YOUR live link from Lesson 7.** On the website, the API was on the same address (`/api/...`). A phone app runs on the phone, so it needs the **full** address.

## V2. ✍️ The API helper for the phone

Create **`mobile/src/api.js`**:

```js
// Same idea as client/src/api.js – but for the phone:
// - full address (the app does not run on the same server as the API)
// - the token lives in SecureStore (encrypted phone storage) instead of localStorage
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const TOKEN_KEY = 'token';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const setToken = (token) =>
  token ? SecureStore.setItemAsync(TOKEN_KEY, token) : SecureStore.deleteItemAsync(TOKEN_KEY);

// App.js tells us what to do when the token is no longer valid
let onLogout = () => {};
export const setOnLogout = (fn) => { onLogout = fn; };

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No connection to the server. Check your internet and API_URL in src/config.js');
  }

  // Token expired -> forget it and go back to the login screen
  if (res.status === 401 && token) {
    await setToken(null);
    onLogout();
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `${method} ${path} failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}
```

Compare it with `client/src/api.js` – almost the same! Differences:

- `${API_URL}/api${path}` – full address
- `SecureStore` instead of `localStorage`. Its functions are **async** (they return a Promise), so we use `await`.
- there is no `window` on a phone, so instead of a `logout` event, `App.js` gives us a function with `setOnLogout`
- a clear message if the phone has no connection

## V3. ✍️ Shared styles

On the phone there is no CSS file. Styles are JavaScript objects. Create **`mobile/src/theme.js`**:

```js
// One place for colours and shared styles, so all screens look the same
import { StyleSheet } from 'react-native';

export const colors = {
  navy: '#1d3557',
  bg: '#f6f6f8',
  card: '#ffffff',
  text: '#1d1d1f',
  muted: '#666666',
  border: '#dddddd',
  danger: '#c1121f',
  dangerBg: '#fde2e4',
  warnBg: '#fff3cd',
};

export const ui = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  hint: { fontSize: 13, color: colors.muted },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#fff',
  },
  button: { backgroundColor: colors.navy, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  chip: { borderWidth: 1, borderColor: colors.navy, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: colors.navy },
  chipText: { color: colors.navy, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  error: { backgroundColor: colors.dangerBg, color: colors.danger, padding: 10, borderRadius: 8, overflow: 'hidden' },
});
```

- `StyleSheet.create({ ... })` – like CSS classes, but in JavaScript
- names are **camelCase**: `background-color` → `backgroundColor`, `border-radius` → `borderRadius`
- numbers have **no unit**: `padding: 14` (not `'14px'`)

## V4. ✍️ The login screen

Create the folder **`mobile/src/screens`** and in it **`mobile/src/screens/LoginScreen.js`**:

```js
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { api } from '../api';
import { colors, ui } from '../theme';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      // Same API as the website: POST /api/auth/login or /api/auth/register
      const data = await api(`/auth/${mode}`, { method: 'POST', body: { email, password } });
      await onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[ui.card, styles.card]}>
        <Text style={ui.title}>{isLogin ? '👋 Welcome back' : '✨ Create your account'}</Text>
        <Text style={ui.hint}>3D Map + AI Calendar</Text>

        <View>
          <Text style={ui.label}>Email</Text>
          <TextInput
            style={ui.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
        </View>
        <View>
          <Text style={ui.label}>Password</Text>
          <TextInput
            style={ui.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="at least 6 characters"
          />
        </View>

        {error ? <Text style={ui.error}>{error}</Text> : null}

        <Pressable style={[ui.button, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          <Text style={ui.buttonText}>{loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</Text>
        </Pressable>

        <Pressable onPress={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}>
          <Text style={ui.hint}>
            {isLogin ? 'No account yet? ' : 'Already have an account? '}
            <Text style={styles.link}>{isLogin ? 'Create one' : 'Log in'}</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.navy },
  card: { gap: 14, padding: 22 },
  link: { color: colors.navy, fontWeight: '600', textDecorationLine: 'underline' },
});
```

Put it next to `client/src/pages/LoginPage.jsx` – the **logic is identical**. Only the building blocks change:

| Website | Phone |
|---|---|
| `<form onSubmit>` | no forms – the button's `onPress` calls `submit` |
| `<input type="email" onChange={e => setEmail(e.target.value)}>` | `<TextInput keyboardType="email-address" onChangeText={setEmail}>` |
| `<input type="password">` | `<TextInput secureTextEntry>` |
| `<button>` | `<Pressable><Text>…</Text></Pressable>` – **all text must be inside `<Text>`** |

`KeyboardAvoidingView` moves the form up when the keyboard opens on iPhone.

## V5. ✍️ App.js: login first, then the tabs

The map and calendar screens come in Parts W and X. For now, create two small placeholders so the app works already.

Create **`mobile/src/screens/MapScreen.js`**:

```js
import { Text, View } from 'react-native';

export default function MapScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>🗺️ The map comes in Part W</Text>
    </View>
  );
}
```

Create **`mobile/src/screens/CalendarScreen.js`**:

```js
import { Text, View } from 'react-native';

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>📅 The calendar comes in Part X</Text>
    </View>
  );
}
```

Replace **`mobile/App.js`** with:

```js
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { api, getToken, setOnLogout, setToken } from './src/api';
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { colors } from './src/theme';

const TABS = {
  map: { label: '🗺️ 3D Map', component: MapScreen },
  calendar: { label: '📅 Calendar', component: CalendarScreen },
};

export default function App() {
  const [user, setUser] = useState(null);       // null = not logged in
  const [checking, setChecking] = useState(true); // looking for a saved token
  const [tab, setTab] = useState('map');

  useEffect(() => {
    setOnLogout(() => setUser(null)); // api.js calls this when the token expired

    // App opened: is there a saved token? Then ask the server who we are.
    getToken()
      .then((token) => token && api('/auth/me').then(setUser))
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async ({ token, user }) => {
    await setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
    setTab('map');
  };

  let content;
  if (checking) {
    content = <ActivityIndicator style={{ flex: 1 }} size="large" />;
  } else if (!user) {
    content = <LoginScreen onLogin={login} />;
  } else {
    const Screen = TABS[tab].component;
    content = (
      <>
        <View style={styles.header}>
          <Text style={styles.headerText} numberOfLines={1}>{user.email}</Text>
          <Pressable onPress={logout}><Text style={styles.logout}>Log out</Text></Pressable>
        </View>
        <View style={{ flex: 1 }}>
          <Screen />
        </View>
        <View style={styles.tabBar}>
          {Object.entries(TABS).map(([key, { label }]) => (
            <Pressable key={key} style={styles.tab} onPress={() => setTab(key)}>
              <Text style={[styles.tabText, tab === key && styles.tabActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>{content}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 10 },
  headerText: { color: '#cfd8e3', flex: 1 },
  logout: { color: '#fff', fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 15, color: colors.muted },
  tabActive: { color: colors.navy, fontWeight: '700' },
});
```

The same ideas as `client/src/App.jsx`: `user` state, check the saved token on start (`/auth/me`), `login` / `logout`, and a `TABS` object – this time as a **tab bar at the bottom**, like real apps.

**📱 Test it:** the phone shows the login screen. Log in with **the same email and password as on your website**. 🎉 Your email appears at the top. Close Expo Go and open the app again → still logged in (SecureStore).

---

# Part W – The 3D map

## W1. ✍️ Map screen

Replace **`mobile/src/screens/MapScreen.js`** with:

```js
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { api } from '../api';
import { colors, ui } from '../theme';

const CITIES = {
  Berlin: { latitude: 52.5163, longitude: 13.3777 },
  Cologne: { latitude: 50.9413, longitude: 6.9583 },
  'New York': { latitude: 40.7484, longitude: -73.9857 },
  Tokyo: { latitude: 35.6812, longitude: 139.7671 },
};

// A tilted camera = 3D look (pitch tilts it, heading turns it)
const camera = (center) => ({ center, pitch: 60, heading: -20, altitude: 600, zoom: 17 });

export default function MapScreen() {
  const mapRef = useRef(null);
  const [places, setPlaces] = useState([]);
  const [pending, setPending] = useState(null); // coordinate of a new place, while we ask for its name
  const [name, setName] = useState('');

  // Load my saved places once
  useEffect(() => {
    api('/places').then(setPlaces).catch((err) => Alert.alert('Error', err.message));
  }, []);

  const flyTo = (center) => mapRef.current?.animateCamera(camera(center), { duration: 1500 });

  // Long press on the map -> ask for a name
  const startAdd = (e) => {
    setPending(e.nativeEvent.coordinate);
    setName('');
  };

  const savePlace = async () => {
    if (!name.trim()) return;
    try {
      const place = await api('/places', {
        method: 'POST',
        body: { name: name.trim(), lat: pending.latitude, lng: pending.longitude },
      });
      setPlaces((prev) => [...prev, place]);
      setPending(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const removePlace = (place) => {
    Alert.alert('Delete place?', place.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api(`/places/${place.id}`, { method: 'DELETE' });
          setPlaces((prev) => prev.filter((p) => p.id !== place.id));
        },
      },
    ]);
  };

  return (
    <View style={styles.page}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialCamera={camera(CITIES.Berlin)}
        showsBuildings
        pitchEnabled
        rotateEnabled
        onLongPress={startAdd}
      >
        {places.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.name} />
        ))}
      </MapView>

      {/* City buttons on top of the map */}
      <ScrollView horizontal style={styles.topBar} contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
        {Object.entries(CITIES).map(([city, center]) => (
          <Pressable key={city} style={styles.pill} onPress={() => flyTo(center)}>
            <Text style={styles.pillText}>{city}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* My places at the bottom: tap = fly there, long press = delete */}
      <View style={styles.bottomBar}>
        <Text style={ui.hint}>
          {places.length ? 'My places (tap = go, hold = delete)' : 'Hold your finger on the map to save a place'}
        </Text>
        <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
          {places.map((p) => (
            <Pressable
              key={p.id}
              style={ui.chip}
              onPress={() => flyTo({ latitude: p.lat, longitude: p.lng })}
              onLongPress={() => removePlace(p)}
            >
              <Text style={ui.chipText}>📍 {p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Small dialog for the name of a new place */}
      <Modal visible={!!pending} transparent animationType="fade" onRequestClose={() => setPending(null)}>
        <View style={styles.backdrop}>
          <View style={[ui.card, { gap: 12 }]}>
            <Text style={ui.title}>New place</Text>
            <TextInput style={ui.input} value={name} onChangeText={setName} placeholder="e.g. SRH Campus" autoFocus />
            <Pressable style={ui.button} onPress={savePlace}>
              <Text style={ui.buttonText}>Save</Text>
            </Pressable>
            <Pressable onPress={() => setPending(null)}>
              <Text style={[ui.hint, { textAlign: 'center' }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  topBar: { position: 'absolute', top: 10, left: 0, right: 0, flexGrow: 0 },
  row: { gap: 8, paddingHorizontal: 12, alignItems: 'center' },
  pill: { backgroundColor: colors.navy, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { color: '#fff', fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, paddingVertical: 10, gap: 8,
    paddingLeft: 12,
  },
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.4)' },
});
```

- **`<MapView>`** draws Apple Maps (iPhone) or Google Maps (Android)
- **`camera`**: `pitch: 60` tilts the view, `heading` turns it, `showsBuildings` → **3D buildings**
- **`animateCamera`** flies smoothly to a city – the same idea as `map.flyTo` on the website
- **`onLongPress`** – hold your finger on the map → a **`Modal`** (small window) asks for the name → `POST /api/places`
- **`<Marker>`** – one pin per saved place
- `StyleSheet.absoluteFill` – the map fills the whole screen; the buttons float on top (`position: 'absolute'`)

**📱 Test it:** **3D Map** tab → you see your places from the website (e.g. Brandenburg Gate). Tap **Tokyo** → the camera flies there. Tilt with two fingers. Hold your finger on a building → name it → it appears on the **website** too (refresh it)!

---

# Part X – The calendar

## X1. ✍️ Copy the date helpers

The date helpers are plain JavaScript – they work on the phone unchanged. Create the folder **`mobile/src/utils`** and copy the file:

```bash
mkdir -p src/utils
cp ../client/src/utils/dates.js src/utils/dates.js
```

*(Run this inside `mobile/`. On Windows without Git Bash: copy `client/src/utils/dates.js` to `mobile/src/utils/dates.js` in VS Code.)*

## X2. ✍️ Calendar screen

Replace **`mobile/src/screens/CalendarScreen.js`** with:

```js
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { addDays, formatLong, relative, todayYMD } from '../utils/dates';
import { colors, ui } from '../theme';

const PRIORITIES = ['low', 'medium', 'high'];
const QUICK_DEADLINES = [3, 7, 14, 30]; // "in X days" buttons instead of a date picker

const emptyForm = () => ({ title: '', hours: '3', deadline: addDays(todayYMD(), 7), priority: 'medium' });

export default function CalendarScreen() {
  const [tasks, setTasks] = useState([]);
  const [plan, setPlan] = useState({ days: {}, atRisk: [] });
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  // Load tasks + plan from the same API as the website
  const load = useCallback(async () => {
    const [list, newPlan] = await Promise.all([
      api('/tasks'),
      api('/tasks/plan', { method: 'POST', body: { maxHoursPerDay: 4, today: todayYMD() } }),
    ]);
    setTasks(list);
    setPlan(newPlan);
  }, []);

  useEffect(() => {
    load().catch((err) => Alert.alert('Error', err.message));
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  // ---- Task actions (after each change: load again, so the plan updates) ----
  const addTask = async () => {
    if (!form.title.trim()) return Alert.alert('Please enter a title');
    try {
      await api('/tasks', { method: 'POST', body: { ...form, hours: Number(form.hours) || 1 } });
      setForm(emptyForm());
      await load();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const toggleDone = async (task) => {
    await api(`/tasks/${task.id}`, { method: 'PATCH', body: { done: !task.done } });
    await load();
  };

  const removeTask = (task) => {
    Alert.alert('Delete task?', task.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api(`/tasks/${task.id}`, { method: 'DELETE' }); await load(); } },
    ]);
  };

  // ---- Agenda: every day that has work sessions or deadlines, sorted ----
  const agenda = {};
  for (const [day, sessions] of Object.entries(plan.days)) {
    agenda[day] = sessions.map((s, i) => ({ key: `s${s.taskId}-${i}`, text: `📖 ${s.title}`, hours: s.hours }));
  }
  for (const t of tasks.filter((t) => !t.done)) {
    (agenda[t.deadline] ||= []).push({ key: `d${t.id}`, text: `🏁 ${t.title} is due`, color: t.color });
  }
  const days = Object.keys(agenda).filter((d) => d >= todayYMD()).sort().slice(0, 14);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={ui.title}>AI Calendar</Text>
      <Text style={[ui.hint, { marginBottom: 12 }]}>Add a task – your work gets spread out before the deadline.</Text>

      {/* ---- New task ---- */}
      <View style={[ui.card, { gap: 10 }]}>
        <TextInput
          style={ui.input}
          placeholder="What do you need to do?"
          value={form.title}
          onChangeText={(title) => setForm({ ...form, title })}
        />
        <View style={styles.row}>
          <Text style={ui.label}>Hours</Text>
          <TextInput
            style={[ui.input, { width: 70 }]}
            keyboardType="numeric"
            value={form.hours}
            onChangeText={(hours) => setForm({ ...form, hours })}
          />
          <Text style={[ui.hint, { flex: 1, textAlign: 'right' }]}>Due {formatLong(form.deadline)}</Text>
        </View>
        <View style={styles.row}>
          {QUICK_DEADLINES.map((n) => {
            const active = form.deadline === addDays(todayYMD(), n);
            return (
              <Pressable key={n} style={[ui.chip, active && ui.chipActive]} onPress={() => setForm({ ...form, deadline: addDays(todayYMD(), n) })}>
                <Text style={[ui.chipText, active && ui.chipTextActive]}>{n} days</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.row}>
          {PRIORITIES.map((p) => (
            <Pressable key={p} style={[ui.chip, form.priority === p && ui.chipActive]} onPress={() => setForm({ ...form, priority: p })}>
              <Text style={[ui.chipText, form.priority === p && ui.chipTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={ui.button} onPress={addTask}>
          <Text style={ui.buttonText}>+ Add task</Text>
        </Pressable>
      </View>

      {/* ---- At-risk warning ---- */}
      {plan.atRisk.length > 0 && (
        <View style={[ui.card, { backgroundColor: colors.warnBg }]}>
          <Text style={{ fontWeight: '600' }}>⚠️ Not enough time before the deadline:</Text>
          {plan.atRisk.map((r) => (
            <Text key={r.taskId}>• {r.title}: {r.missingHours}h missing</Text>
          ))}
        </View>
      )}

      {/* ---- Agenda ---- */}
      <Text style={styles.heading}>Your plan</Text>
      {days.length === 0 && <Text style={ui.hint}>Nothing planned yet.</Text>}
      {days.map((day) => (
        <View key={day} style={ui.card}>
          <Text style={styles.day}>{formatLong(day)} · {relative(day)}</Text>
          {agenda[day].map((item) => (
            <View key={item.key} style={styles.item}>
              <Text style={[styles.itemText, item.color && { color: item.color, fontWeight: '600' }]}>{item.text}</Text>
              {item.hours ? <Text style={ui.hint}>{item.hours}h</Text> : null}
            </View>
          ))}
        </View>
      ))}

      {/* ---- All tasks ---- */}
      <Text style={styles.heading}>Tasks</Text>
      {tasks.length === 0 && <Text style={ui.hint}>No tasks yet.</Text>}
      {tasks.map((t) => (
        <View key={t.id} style={[ui.card, styles.task, t.done && { opacity: 0.5 }]}>
          <Pressable onPress={() => toggleDone(t)} style={[styles.check, t.done && { backgroundColor: colors.navy }]}>
            {t.done ? <Text style={{ color: '#fff' }}>✓</Text> : null}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, t.done && { textDecorationLine: 'line-through' }]}>{t.title}</Text>
            <Text style={ui.hint}>{t.hours}h · {t.priority} · due {relative(t.deadline)}</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: t.color }]} />
          <Pressable onPress={() => removeTask(t)} hitSlop={10}>
            <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heading: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
  day: { fontWeight: '700', marginBottom: 6 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  itemText: { flex: 1 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontWeight: '600', fontSize: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
```

A month grid is too small for a phone, so we show an **agenda**: the next days, each with its work sessions 📖 and deadlines 🏁.

- the **plan comes from the same server**: `POST /api/tasks/plan` – we didn't write the planner again!
- **"3 / 7 / 14 / 30 days"** buttons instead of a date picker – faster to tap on a phone
- `RefreshControl` – **pull down** to reload (like in every app)
- after every change we call `load()` again, so the plan updates

**📱 Test it:** **Calendar** tab → your tasks from the website are here. Add *"Read paper"*, 4h, 7 days → it appears in the plan, split into sessions. Tick a task as done → the website shows it as done too. **One database, two apps.** 🎉

---

# Part Y – Test the phone app automatically

You can't tap through the app after every change. Tests can – without a phone.

## Y1. Install the test tools

Inside `mobile/`:

```bash
npm install --save-dev jest-expo jest @testing-library/react-native test-renderer undici
```

- **jest-expo** – runs React Native code on your laptop
- **@testing-library/react-native** – *"find the button with this text, press it"*
- **undici** – a real `fetch`, so the tests talk to your real server

Open **`mobile/package.json`** and add two things: the line `"test": "jest"` inside `"scripts"`, and a new block `"jest": { "preset": "jest-expo" }` at the end.

<details>
<summary>✅ <b>Checkpoint:</b> your <code>mobile/package.json</code> should now look like this</summary>

Your version numbers may be a little different – that's fine.

```json
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "expo": "~58.0.22",
    "expo-secure-store": "~58.0.2",
    "expo-status-bar": "~58.0.4",
    "react": "19.3.0",
    "react-native": "0.88.1",
    "react-native-maps": "1.29.11",
    "react-native-safe-area-context": "~5.10.1"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest"
  },
  "private": true,
  "devDependencies": {
    "@testing-library/react-native": "^14.1.0",
    "jest": "^30.5.2",
    "jest-expo": "~58.0.13",
    "test-renderer": "^1.3.1",
    "undici": "^8.12.3"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```
</details>

## Y2. ✍️ The screen test

Create the folder **`mobile/__tests__`** and in it **`mobile/__tests__/app.test.js`**:

```js
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
```

- **`jest.mock(...)`** replaces things that only exist on a real phone (SecureStore, the map, screen insets) with simple fakes
- the test **renders the real `App`**, types an email, presses *Create account*, checks the map and the calendar – like a user
- it talks to your **local** server (`localhost:3001`), not the live one, so test accounts don't end up in your real database

## Y3. Run it

Terminal 1, in the **root** folder: `npm run dev` (starts the local server). Terminal 2:

```bash
cd mobile
npm test
```

👀 **You see:** `Tests: 2 passed`. *(Yellow "act(...)" warnings are normal here.)*

## Y4. ✍️ GitHub runs the phone tests too

Replace **`.github/workflows/ci.yml`** (root folder) with:

```yaml
# Runs automatically on GitHub every time someone pushes code.
# Green check = the app builds and all tests pass. Red cross = something broke.
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    # A throw-away PostgreSQL database just for the tests
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: course
          POSTGRES_PASSWORD: course
          POSTGRES_DB: appdev
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-timeout 5s --health-retries 10

    env:
      DATABASE_URL: postgresql://course:course@localhost:5432/appdev
      JWT_SECRET: ci-test-secret

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci           # install exactly the versions in package-lock.json
      - run: npm run build    # does the frontend build?
      - run: npm test         # planner + API tests

      # Mobile app: start the API in the background, then test the phone screens against it
      - name: Mobile app tests
        run: |
          npm start -w server &
          for i in $(seq 1 30); do curl -sf localhost:3001/api/health && break; sleep 1; done
          cd mobile
          npm ci
          npm test
```

New last step: start the API in the background, then install and test the mobile app.

Create **`.vercelignore`** in the **root** folder, so Vercel doesn't upload the phone app with the website:

```
# The phone app is not part of the website deployment
mobile
```

Back in the **root** folder, save and push everything:

```bash
cd ..
git add .
git commit -m "Lesson 8: mobile app"
git push
```

GitHub → **Actions** → green ✅ for the website **and** the phone app.

---

# 🎉 You built a mobile app!

| | Website | Phone app |
|---|---|---|
| Folder | `client/` | `mobile/` |
| Built with | React + Vite | React Native + Expo |
| Runs in | the browser | Expo Go (later: App Store / Play Store) |
| Server, database, login, planner | **shared** | **shared** |

## 🛠️ Troubleshooting

| You see | Fix |
|---|---|
| QR code scanned, but *"Could not connect to development server"* | same Wi-Fi? Otherwise `npx expo start --tunnel` |
| *"No connection to the server"* | wrong link in `src/config.js` – open `<your link>/api/health` on the phone's browser |
| *"Server is not configured…"* | your live server misses a variable – Lesson 7, T7 |
| *"Wrong email or password"* but it works on the website | check the email for a capital letter / space at the end |
| Red error screen in the app | read the first line – it names the file and line. Fix, save, the app reloads |
| `npm test`: *"Start the server first"* | run `npm run dev` in the root folder in another terminal |

## 💪 Bonus exercises

**A.** Show a small "👋 Hi, *name*" on the calendar screen. *(Hint: pass `user` from `App.js` as a prop.)*

**B.** Add a third tab **"Profile"** with your email and the log-out button. *(Hint: one more entry in `TABS`.)*

**C.** Use the phone's location: `npx expo install expo-location`, then add `showsUserLocation` to `<MapView>`.

**D.** Put the app on your phone **without** Expo Go: look up **EAS Build** (`npx eas-cli build --profile preview`).

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **React Native** | React for iPhone and Android apps – real native screens, not a website |
| **Expo / Expo Go** | tools to build and run React Native apps without Xcode or Android Studio |
| **`View` / `Text` / `Pressable` / `TextInput`** | the phone's versions of `div`, `p`, `button`, `input` |
| **`StyleSheet`** | styles as JavaScript objects (camelCase, no units) |
| **SecureStore** | encrypted storage on the phone (for the token) |
| **Modal** | a small window on top of the screen |
| **Mock** | a fake replacement used in tests |
| **Hot reload** | save a file → the phone updates instantly |
