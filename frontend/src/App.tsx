import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from './assets/worldmap_large.json';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { GeoJSON as LeafletGeoJSON, LatLngBounds, Layer, LeafletEvent, LeafletMouseEvent } from 'leaflet';
import TaskBar from './TaskBar';

interface CountryData {
  countryName: string;
  songlist: any;
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
const CURRENT_TILE_LAYER = TILE_LAYERS.openStreetMap; // modify this to switch between tile layers

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
  weight: 0.1,
  color: 'white',
  fillOpacity: 0.8
});

var serverResponsive = true;

async function pingServer() {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', `http://127.0.0.1:5000/ping`)
  var res = new Promise<boolean>((resolve, reject) => {
    xhr.addEventListener('load', () => {
      resolve(true);
    });
    xhr.addEventListener('timeout', () => {
      if (serverResponsive) {
        alert("Timeout connecting to server")
        serverResponsive = false;
      }
      resolve(false);
    });
    xhr.addEventListener('error', () => {
      if (serverResponsive) {
        alert("Error connecting to server");
        serverResponsive = false;
      }
      resolve(false);
    })
  });
  xhr.send()
  return await res;
}

const fetchMusicStats = async (countryCode: string) => {
  if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest()
  xhr.open('GET', `http://127.0.0.1:5000/country_top_tracks?country_code=${countryCode.toLowerCase()}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText)
      resolve(data)
      //resolve(data.map((song:any) => Object({song: song, genre: "todo", streams: "todo"})))
    })
  });
  xhr.send()
  return await res
  //return { country: countryName, topArtist: "Example Artist", genre: "Pop", streams: "10M+" };
};

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [popupDetails, setPopupDetails] = useState<{ type: string; value: string} | null>(null);

  pingServer();

  const highlightFeature = (e: LeafletMouseEvent) => {
    const layer = e.target;

    layer.setStyle({
      weight: 2.5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.5
    });

    layer.bringToFront();
  };

  const resetHighlight = (e: LeafletMouseEvent) => { //country back to default colour
    const layer = e.target;
    layer.setStyle(styleFeature(e.target.feature));
  };

  const displayCountryData = async (e: LeafletMouseEvent) => {
    const countryProp = e.target.feature?.properties;
    if (!countryProp) return;

    const songlist = await fetchMusicStats(countryProp.wb_a2);
    setSelectedCountry({
      countryName: countryProp.name,
      songlist,
      topArtist: "todo",
      genre: "todo",
      streams: "todo"
    });
  };
  const handleSecondaryPopup = (type: string, value: string) => {
    if (!selectedCountry) return;
    setPopupDetails({ type, value});
  };

  const onEachFeature = async (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    layer.on({
      click: displayCountryData,
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
  };

  return (
    <>
      <TaskBar />
      <div id="map">
        <MapContainer center={[51.505, -0.09]} zoom={3} className="fullscreen-map"
          maxBounds={[[85, 180], [-85, -180]]} minZoom={3} zoomControl={false}>
          <TileLayer
            attribution={CURRENT_TILE_LAYER.attribution}
            url={CURRENT_TILE_LAYER.url}
            noWrap={true}
          />
          <GeoJSON
            data={worldGeoJSON as GeoJSON.GeoJsonObject}
            style={styleFeature} //sets unclicked default style
            onEachFeature={onEachFeature}
          >
            {selectedCountry && (
              <Popup>
                <strong>{selectedCountry.countryName}</strong><br />
                <ul>
                {selectedCountry.songlist.slice(0, 5).map((song:any) => <li>{song.song_name}</li>)}
                </ul>
                Top Artist: {selectedCountry.topArtist}<br />
                Genre: {selectedCountry.genre}<br />
                
                {/* Streams: {selectedCountry.streams} */}
                <span style={{ fontWeight: "bold", cursor: "pointer", color: "blue", textDecoration: "underline" }}
                onClick={(e) => handleSecondaryPopup("streams", selectedCountry.streams)}
                >Streams: {selectedCountry.streams}
                </span>

              </Popup>
            )}

            {popupDetails && ( //for the secondary pop up 
              <Popup>
                <strong>{popupDetails.type.toUpperCase()}</strong><br />
                {popupDetails.value}<br />
                <p>More details about {popupDetails.value}...</p>
                <button onClick={() => setPopupDetails(null)}>Close</button>
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
