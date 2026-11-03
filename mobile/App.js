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
