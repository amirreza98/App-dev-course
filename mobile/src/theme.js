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