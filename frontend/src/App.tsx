import { useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from './assets/worldmap_large.json';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { Layer, LeafletMouseEvent } from 'leaflet';
import TaskBar from './TaskBar';
import Sidebar from "./Sidebar";
import useStableCallback from './useStableCallback';
interface CountryData {
  countryName: string;
  countryCode: string;
  songlist: any;
  topArtist: string;
  genre: string;
  streams: string;
}

type CountrySimilarityData = {
  country_code: string;
  name: string
  similarity: number;
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
  weight: 2,
  color: '#d0d0d0',
  // color: 'white',
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

const fetchSearchComplete = async (prefix: string) => {
  if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest()
  xhr.open('GET', `http://127.0.0.1:5000/search_complete?prefix=${prefix}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText)
      resolve(data)
    })
  });
  xhr.send()
  return await res
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

const fetchCountryCompareData = async (countryCode: string) => {
  if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest()
  xhr.open('GET', `http://127.0.0.1:5000/country_compare?country_code=${countryCode.toLowerCase()}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText)
      resolve(data)
    })
  });
  xhr.send()
  return await res
};

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [popupDetails, setPopupDetails] = useState<{ type: string; value: string } | null>(null);
  const [previousLayer, setPreviousLayer] = useState<Layer | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const sidebarToggleHandler = () => {
    setSidebarOpen(curr => !curr);
  }

  pingServer();

  const highlightFeature = (e: LeafletMouseEvent) => {
    const layer = e.target;
    const countryCode = layer.feature?.properties?.wb_a2;


    layer.setStyle({
      weight: 2.5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.5
    });

    layer.bringToFront();
    if (selectedCountry?.countryName != e.target.feature?.properties.name){
      layer.setStyle({
        weight: 5.5,
        color: '#361836',
        dashArray: '',
        fillOpacity: 0.7,
      });
  
      layer.bringToFront(); 
    }
  };

  const resetHighlight = (e: LeafletMouseEvent) => { 
    const layer = e.target;
    const countryCode = layer.feature?.properties?.wb_a2;

    if (selectedCountry?.countryName === e.target.feature?.properties.name){
      return;
    }
    if (selectedCountry?.countryName != e.target.feature?.properties.name){
      layer.setStyle(styleFeature(e.target.feature));
    }
    layer.setStyle(styleFeature(e.target.feature));
  };

  const displayCountryData = async (e: LeafletMouseEvent) => {
    const layer = e.target;
    const countryProp = e.target.feature?.properties;
    if (!countryProp) return;

    const countryCode = layer.feature?.properties?.wb_a2;
    const songlist = await fetchMusicStats(countryProp.wb_a2);
    // const songlist = [{ key:1, song_name: "Example song 1"}];
    setSelectedCountryCode(countryCode);
    
    if (previousLayer) {
      (previousLayer as L.Path).setStyle(styleFeature((previousLayer as any).feature));
    }

    // only fires if you select a new country (avoids constantly replaying the same song - don't know if this feature is desireable)
    if (countryCode != selectedCountry?.countryCode) {
      setSelectedCountry({
        countryName: countryProp.name,
        countryCode: layer.feature?.properties?.wb_a2,
        songlist,
        topArtist: "todo",
        genre: "todo",
        streams: "todo"
      });
      console.log(selectedCountry?.countryCode);
    }
    

    layer.setStyle({
      weight: 5.5,
      color: '#361836',
      fillColor: '#361836',
      dashArray: '',
      fillOpacity: 0.5,
      opacity:1
    });
  
    layer.bringToFront();    
    setSidebarOpen(true);
    setPreviousLayer(layer);

  };
  const stableDisplayCountryData = useStableCallback(displayCountryData);
  const stableResetHighlight = useStableCallback(resetHighlight);
  const stableHighlightFeature = useStableCallback(highlightFeature);
  const handleSecondaryPopup = (type: string, value: string) => {
    if (!selectedCountry) return;
    setPopupDetails({ type, value });
    // setSidebarData({ type, value });

  };

  const onEachFeature = async (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
    layer.on({
      click: stableDisplayCountryData,
      mouseover: stableHighlightFeature,
      mouseout: stableResetHighlight
    });
  };

  const doHeatMap = async () => {
    const countrySimilarities: CountrySimilarityData[] = (await fetchCountryCompareData("gb")) as CountrySimilarityData[];
    
    alert(countrySimilarities)
  };

  return (
    <>
      <div id="map" className="w-0 h-full fixed top-0 left-0 z-1">
        <TaskBar onCountryCompare={doHeatMap}autocomplete={fetchSearchComplete} />
        <Sidebar isOpen={isSidebarOpen} toggle={sidebarToggleHandler} selectedCountry={selectedCountry} />
      </div>
      
      <div id="map-container" className="flex">
        <MapContainer center={[51.505, -0.09]} zoom={3} style={{ position: "static", top: "0px", left: "0px", "zIndex": "0" }}
          maxBounds={[[85, 180], [-85, -180]]} minZoom={3} zoomControl={false}>
          {/* <TileLayer
            attribution={CURRENT_TILE_LAYER.attribution}
            url={CURRENT_TILE_LAYER.url}
            noWrap={true}
          /> 
          tile layer not needed anymore */ }
          <GeoJSON
            data={worldGeoJSON as GeoJSON.GeoJsonObject}
            style={styleFeature} //sets unclicked default style
            onEachFeature={onEachFeature}
          >
            {selectedCountry && (
              <Popup>
                <strong>{selectedCountry.countryName}</strong><br />
                
                <ul>
                  {selectedCountry.songlist.slice(0, 5).map((song: any) => <li>{song.song_name}</li>)}
                {/* {selectedCountry.songlist.slice(0, 5).map((song: any) => ( //for zack changes
                    <li key={song.song_name} 
                        style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                        onClick={() => handleSidebarOpen("Song", song.song_name)}>
                      {song.song_name}
                    </li>
                  ))} */}
                </ul>

                <span style={{ fontWeight: "bold", cursor: "pointer", color: "#361836", textDecoration: "underline" }}
                onClick={() => handleSecondaryPopup("streams", selectedCountry.streams)}
                >Top Artist
                </span>: {selectedCountry.topArtist} <br />

                <span style={{ fontWeight: "bold", cursor: "pointer", color: "#361836", textDecoration: "underline" }}
                onClick={() => handleSecondaryPopup("streams", selectedCountry.streams)}
                >Genre
                </span>: {selectedCountry.genre} <br />

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

        </MapContainer>
      </div>
    </>
  );
}

export default App;
