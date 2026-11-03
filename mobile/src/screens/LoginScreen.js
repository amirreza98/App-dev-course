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
