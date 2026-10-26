import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { api } from '../api.js';

// Tell MapLibre where its web worker (tile decoder) lives, so Vite can serve/bundle it
maplibregl.setWorkerUrl(workerUrl);

// Free map tiles, no API key needed: https://openfreemap.org
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const CITIES = {
  Berlin: [13.405, 52.52],
  Cologne: [6.9603, 50.9375],
  'New York': [-73.9857, 40.7484],
  Tokyo: [139.7671, 35.6812],
};

export default function MapPage() {
  const containerRef = useRef(null); // the <div> the map is drawn into
  const mapRef = useRef(null);       // the map object, so buttons can control it
  const markersRef = useRef([]);     // the red pins currently on the map
  const [places, setPlaces] = useState([]); // NEW in step 2: places saved on the server

  // Create the map once, when the page appears
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: CITIES.Berlin,
      zoom: 15.5,
      pitch: 60, // tilt the camera -> 3D look
      bearing: -20,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    map.on('load', () => {
      // Make sure buildings are extruded in 3D
      if (!map.getLayer('building-3d')) {
        map.addLayer({
          id: 'building-3d',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#d6cfc4',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.85,
          },
        });
      }
    });

    // NEW: click on the map -> save a place on the server
    map.on('click', async (e) => {
      const name = window.prompt('Name this place:');
      if (!name) return;
      const place = await api('/places', {
        method: 'POST',
        body: { name, lng: e.lngLat.lng, lat: e.lngLat.lat },
      });
      setPlaces((prev) => [...prev, place]);
    });

    mapRef.current = map;
    return () => map.remove(); // clean up when leaving the page
  }, []);

  // NEW: load saved places from the server
  useEffect(() => {
    api('/places').then(setPlaces).catch(console.error);
  }, []);

  // NEW: draw a red marker for every place (runs again whenever `places` changes)
  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = places.map((p) =>
      new maplibregl.Marker({ color: '#e63946' })
        .setLngLat([p.lng, p.lat])
        .setPopup(new maplibregl.Popup().setText(p.name))
        .addTo(mapRef.current)
    );
  }, [places]);

  const flyTo = (center) =>
    mapRef.current.flyTo({ center, zoom: 16, pitch: 60, speed: 1.2 });

  return (
    <div className="map-layout">
      <aside className="panel">
        <h2>3D Map</h2>
        <p className="hint">Drag with right mouse / Ctrl to rotate. Click the map to save a place.</p>

        <h3>Cities</h3>
        <div className="buttons">
          {Object.entries(CITIES).map(([name, center]) => (
            <button key={name} onClick={() => flyTo(center)}>{name}</button>
          ))}
        </div>

        <p className="hint">📍 {places.length} saved place(s) — click a red pin to see its name.</p>
      </aside>
      <div ref={containerRef} className="map" />
    </div>
  );
}
