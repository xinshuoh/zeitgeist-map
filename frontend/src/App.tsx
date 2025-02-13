import { useState, useEffect } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from './assets/worldmap_small.json';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { LatLngBounds, Layer, LeafletEvent, LeafletMouseEvent } from 'leaflet';

interface CountryData {
  countryName: string;
  topArtist: string;
  genre: string;
  streams: string;
}

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

// Function to set color based on properties (modify as needed)
const getColor = (population: number) => {
  return population > 1000000000 ? '#800026' :
    population > 500000000 ? '#BD0026' :
      population > 200000000 ? '#E31A1C' :
        population > 100000000 ? '#FC4E2A' :
          population > 50000000 ? '#FD8D3C' :
            population > 20000000 ? '#FEB24C' :
              population > 10000000 ? '#FED976' :
                '#FFEDA0';
};

const styleFeature = (feature: Feature<Geometry, GeoJsonProperties> | undefined) => ({
  fillColor: getColor(feature?.properties?.pop_est || 0),
  weight: 0,
  color: 'white',
  fillOpacity: 0.5
});

const fetchMusicStats = async (countryName: string) => {
  return { country: countryName, topArtist: "Example Artist", genre: "Pop", streams: "10M+" };
};

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  const onEachFeature = async (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    const countryName = feature.properties?.name;
    if (!countryName) return;

    layer.on('click', async () => {
      const musicData = await fetchMusicStats(countryName);
      setSelectedCountry({
        countryName,
        ...musicData
      });
    });
  };

  return (
    <>
      <div id="map">
        <MapContainer center={[51.505, -0.09]} zoom={3} className="fullscreen-map"
          maxBounds={[[85, 180], [-85, -180]]} minZoom={3}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=${RAPIDAPI_KEY}`}
            noWrap={true}
          />
          <GeoJSON
            data={worldGeoJSON as GeoJSON.GeoJsonObject}
            style={styleFeature}
            onEachFeature={onEachFeature}
          >
            {selectedCountry && (
              <Popup>
                <strong>{selectedCountry.countryName}</strong><br />
                Top Artist: {selectedCountry.topArtist}<br />
                Genre: {selectedCountry.genre}<br />
                Streams: {selectedCountry.streams}
              </Popup>
            )}
          </GeoJSON>
          {worldGeoJSON && (
            <>
            </>
          )}

          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </>
  );
}

export default App;
