import { useState, useEffect, useRef } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from './assets/worldmap_large.json';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { Layer, LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import TaskBar from './TaskBar';
import Sidebar from "./Sidebar";
import useStableCallback from './useStableCallback';
// export const [isCountryCompareMode, setIsCountryCompareMode] = useState(false);
// export const [countrySimilarityData, setCountrySimilarityData] = useState<CountrySimilarityData[] | null>(null);

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

// const heatmapLayerRef = useRef<L.GeoJSON | null>(null);

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [popupDetails, setPopupDetails] = useState<{ type: string; value: string } | null>(null);
  const [previousLayer, setPreviousLayer] = useState<Layer | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCountryCompareMode, setIsCountryCompareMode] = useState(false);
  const [countrySimilarityData, setCountrySimilarityData] = useState<CountrySimilarityData[] | null>(null);
  const [heatmapLayer, setHeatmapLayer] = useState<Layer | null>(null);


  const sidebarToggleHandler = () => {
    setSidebarOpen(curr => !curr);
  }
  // const onCountryClick = async (e: LeafletMouseEvent, countryCode: string) => {
  //   if (!isCountryCompareMode) return;
    
  //   const data = await fetchCountryCompareData(countryCode);
  //   setCountrySimilarityData(data as CountrySimilarityData[]);
  //   doHeatmap(data as CountrySimilarityData[]);
  // };
  

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
    
    if (isCountryCompareMode) {
      const data = await fetchCountryCompareData(countryCode);
      console.log(data);
      setCountrySimilarityData(data as CountrySimilarityData[]);
      // console.log("Fetching similarity data for:", selectedCountryCode);
      // console.log("Fetched data:", data);
      console.log("comparemode toggled, entering heatmap");
      layer.setStyle({
        weight: 7.5,
        color: '#361836',
        fillColor: '#361836',
        dashArray: '',
        fillOpacity: 0.8,
        opacity:1
      });
      layer.bringToFront(); 
      setSidebarOpen(false);

      // doHeatmap(data as CountrySimilarityData[]);
    }

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
      // console.log(selectedCountry?.countryCode);
    }
    
    if(!isCountryCompareMode){
    layer.setStyle({
      weight: 5.5,
      color: '#361836',
      fillColor: '#361836',
      dashArray: '',
      fillOpacity: 0.5,
      opacity:1
    });
    setSidebarOpen(true);
  }
  
    layer.bringToFront();    
    // setSidebarOpen(true);
    setPreviousLayer(layer);

  };
  // const heatmapLayerRef = useRef<L.GeoJSON | null>(null);


  
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

  // const doHeatMap = async () => {
  //   const countrySimilarities: CountrySimilarityData[] = (await fetchCountryCompareData("gb")) as CountrySimilarityData[];
  //   alert(JSON.stringify(countrySimilarities));
  // };
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const HeatmapLayer = ({ data }: { data?: CountrySimilarityData[] }) => {
    const map = useMap(); 
    const [heatmapLayer, setHeatmapLayer] = useState<L.GeoJSON | null>(null);
    const heatmapLayerRef = useRef<L.GeoJSON | null>(null);

    useEffect(() => {
      if (!map || !data) return;

      if (heatmapLayerRef.current) { 
        map.removeLayer(heatmapLayerRef.current);
        console.log("heatmap layer in if remove block", heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
      const newLayer = L.geoJSON(worldGeoJSON as GeoJSON.GeoJsonObject, {
        style: (feature) => {
          const similarity = data?.find(c => c.country_code === feature?.properties?.wb_a2.toLowerCase())?.similarity ?? 0;
          console.log("Similarity:", similarity, feature?.properties?.wb_a2.toLowerCase());
          const ccolor = `rgba(255, 0, 0)`;
          return { fillColor: ccolor, fillOpacity: similarity, weight: 1, color: '#361836' };
        }
      });
  
      newLayer.addTo(map);
      newLayer.bringToFront();
      sleep(5000).then(() => { 
        map.removeLayer(newLayer);
        setIsCountryCompareMode(false);
        setCountrySimilarityData(null);
        console.log("Heatmap removed after 20 seconds");
      });


      return () => {
        if (heatmapLayerRef.current) {
          setIsCountryCompareMode(false);
          map.removeLayer(heatmapLayerRef.current);
          heatmapLayerRef.current = null;
          console.log("Heatmap removed on unmount");
        }};
    }, [map, data]); // runs when map or data changes
    
    // const exitCompareMode = () => {
    //   console.log("Exiting compare mode");
    
    //   if (heatmapLayerRef.current) {
    //     console.log("Removing heatmap layer:", heatmapLayerRef.current);
    //     heatmapLayerRef.current.remove(); // Remove the heatmap layer immediately
    //     heatmapLayerRef.current = null;
    //     console.log("Heatmap layer removed");
    //   } else {
    //     console.log("No heatmap layer found when exiting compare mode");
    //   }
    
    //   setIsCountryCompareMode(false);
    // };
    return null;
  };

  const exitCompareMode = () => {
    console.log("exit entered");
    console.log(heatmapLayer);
    setIsCountryCompareMode(false);
    setCountrySimilarityData(null);
    if (heatmapLayer) {
      heatmapLayer.remove(); // Remove the heatmap layer immediately
      setHeatmapLayer(null); // Clear the reference
      console.log("Heatmap layer removed thru button");
    }
    console.log(setIsCountryCompareMode);
  };
  

  // const doHeatmap = (data?: CountrySimilarityData[]) => {
  //   const map2 = useMap();
  //   if (heatmapLayer) {
  //     heatmapLayer.remove(); 
  //   }
  //   const newLayer = L.geoJSON(worldGeoJSON as GeoJSON.GeoJsonObject, {
  //     style: (feature) => {
  //       const similarity = data?.find(c => c.country_code === feature?.properties?.wb_a2)?.similarity ?? 0;
  //       // console.log("Heatmap Data:", data); //gets array okay
  //       console.log("Feature WB_A2:", feature?.properties?.wb_a2); //gets PREVIOUS country code ok
  //       console.log("Similarity:", similarity);
  //       // const color = `rgba(255, 0, 0, ${similarity})`;
  //       const color = `rgba(255, 0, 0)`;
  //       console.log("map made?")
  //       // newLayer.setStyle({
  //       //   weight: 10.5,
  //       //   color: '#eb4034',
  //       //   fillColor: '#eb4034',
  //       //   dashArray: '',
  //       //   fillOpacity: 0.5,
  //       //   opacity:1
  //       // });
  //       return { fillColor: '#eb4034', fillOpacity: 0.8, color: "#32a852", weight: 1 };
  //     }
  //   });
  //   newLayer.bringToFront(); 
  //   setHeatmapLayer(newLayer);
  //   console.log("allegedly set")
  //   newLayer.addTo(map2); 
  //   newLayer.bringToFront(); 
  // };



  return (
    <>
      <div id="map" className="w-0 h-full fixed top-0 left-0 z-1">
        <TaskBar autocomplete={fetchSearchComplete} />
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
          <HeatmapLayer data={countrySimilarityData || undefined} />

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
                <HeatmapLayer data={countrySimilarityData || undefined} />

                {/* <button onClick={() => {
                  exitCompareMode();
                }} style={{ position: 'absolute', top: '120px', left: '700px', zIndex: 1000 }}>
                Exit Compare Mode
                </button> */}
                {/* <button onClick={() => {
                const heatmapLayerInstance = heatmapLayerRef.current;
                if (heatmapLayerInstance) {
                  heatmapLayerInstance.exitCompareMode();
                }
                }} style={{ position: 'absolute', top: '120px', right: '10px', zIndex: 1000 }}>
                Exit Compare Mode
                </button> */}

              <button className ="country-compare" onClick={() => {
                setIsCountryCompareMode((prev) => !prev);
                alert("Click a country to view its music similarity heatmap.");
              }} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
              HELLOOOO
              </button>          
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
