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
