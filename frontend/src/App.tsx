import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from './assets/worldmap_large.json';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { GeoJSON as LeafletGeoJSON, LatLngBounds, Layer, LeafletEvent, LeafletMouseEvent } from 'leaflet';

interface CountryData {
  countryName: string;
  topArtist: string;
  genre: string;
  streams: string;
}

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const TILE_LAYERS = {
  rapidApi: {
    url: `https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=${RAPIDAPI_KEY}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  openStreetMap: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};
const CURRENT_TILE_LAYER = TILE_LAYERS.rapidApi; // modify this to switch between tile layers

// Function to set color based on properties (modify as needed)
const getColor = (population: number) => {
  // return population > 1000000000 ? '#800026' :
  //   population > 500000000 ? '#BD0026' :
  //     population > 200000000 ? '#E31A1C' :
  //       population > 100000000 ? '#FC4E2A' :
  //         population > 50000000 ? '#FD8D3C' :
  //           population > 20000000 ? '#FEB24C' :
  //             population > 10000000 ? '#FED976' :
  //               '#FFEDA0';
  return '#FFFFFF';
};

const styleFeature = (feature: Feature<Geometry, GeoJsonProperties> | undefined) => ({
  fillColor: getColor(feature?.properties?.pop_est || 0),
  weight: 0,
  color: 'white',
  fillOpacity: 0.0
});

const fetchMusicStats = async (countryName: string) => {
  return { country: countryName, topArtist: "Example Artist", genre: "Pop", streams: "10M+" };
};

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  const highlightFeature = (e: LeafletMouseEvent) => {
    const layer = e.target;

    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.0
    });

    layer.bringToFront();
  };

  const resetHighlight = (e: LeafletMouseEvent) => {
    const layer = e.target;
    layer.setStyle(styleFeature(e.target.feature));
  };

  const displayCountryData = async (e: LeafletMouseEvent) => {
    const countryName = e.target.feature?.properties?.name;
    if (!countryName) return;

    const musicData = await fetchMusicStats(countryName);
    setSelectedCountry({
      countryName,
      ...musicData
    });
  };

  const onEachFeature = async (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    layer.on({
      click: displayCountryData,
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
  };

  var xhr = new XMLHttpRequest()
  xhr.addEventListener('load', () => {
    alert(xhr.responseText)
  })
  xhr.open('GET', 'http://127.0.0.1:5000/ping')
  xhr.send()

  return (
    <>
      <div id="map">
        <MapContainer center={[51.505, -0.09]} zoom={3} className="fullscreen-map"
          maxBounds={[[85, 180], [-85, -180]]} minZoom={3}>
          <TileLayer
            attribution={CURRENT_TILE_LAYER.attribution}
            url={CURRENT_TILE_LAYER.url}
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
