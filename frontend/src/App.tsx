import { useState, useEffect, useRef } from 'react';
import './App.css';
import { MapContainer, Marker, Popup, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from './assets/worldmap_large_centered_names.json';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import L, { geoJSON, LatLng, Layer, LeafletMouseEvent } from 'leaflet';
import TaskBar from './TaskBar';
import Sidebar from "./Sidebar";
import FocusView from './FocusView';
import HeatmapControl from './HeatmapControl';
import useStableCallback from './useStableCallback';

import mapStyler from './MapStyling';

import { heatMapPopularity } from './Api';

interface CountryData {
  countryName: string;
  countryCode: string;
  songList: any;
  artistList: any;
  genreList: any;
  streams: string;
}

type CountrySimilarityData = {
  country_code: string;
  name: string;
  similarity: number;
}

interface FocusOptions {
  isOpen: boolean;
  song: any;
  artist: any;
}

enum CountryCompareStatus {
  Disabled,
  Selecting,
  Active
}

var serverResponsive = true;

const fetchSearchComplete = async (prefix: string) => {
  if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `http://127.0.0.1:5000/search_complete?prefix=${prefix}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText);
      resolve(data);
    });
  });
  xhr.send();
  return await res;
}

const fetchMusicStats = async (countryCode: string, stat: string) => {
  if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `http://127.0.0.1:5000/${stat}?country_code=${countryCode.toLowerCase()}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText);
      resolve(data);
    });
  });
  xhr.send();
  return await res;
};

const fetchCountryCompareData = async (countryCode: string) => {
  if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `http://127.0.0.1:5000/country_compare?country_code=${countryCode.toLowerCase()}`);
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText);
      resolve(data);
    });
  });
  xhr.send();
  return await res as CountrySimilarityData[];
};

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [popupDetails, setPopupDetails] = useState<{ type: string; value: string } | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mouseoverCountry, setMouseoverCountry] = useState<string | null>(null);
  const [mouseoverCountryTooltipPosition, setMouseoverCountryTooltipPosition] = useState<LatLng | undefined>(undefined);
  const [focusOptions, setFocusOptions] = useState<FocusOptions>({song: undefined, artist: undefined, isOpen: false});
  const [heatmapSong, setHeatmapSong] = useState<string | null>(null);
  
  const [countryCompareStatus, setCountryCompareStatus] = useState<CountryCompareStatus>(CountryCompareStatus.Disabled);

  const sidebarToggleHandler = () => {
    setSidebarOpen(curr => !curr);
  }

  // this would run it on first render, but means server crash isnt detected until page is reloaded
  //useEffect(() => {
    //pingServer();
  //}, []);

  const geoJsonRef = useRef<any | null>(null);
  const mapStyle = mapStyler(geoJsonRef);

  const highlightFeature = (e: LeafletMouseEvent) => {

    const layer = e.target;
    const countryCode = layer.feature?.properties?.wb_a2;

    mapStyle.mouseover(layer.feature);

    setMouseoverCountryTooltipPosition(new LatLng(layer.feature?.properties?.centre_lat, layer.feature?.properties?.centre_lng));
    setMouseoverCountry(layer.feature?.properties?.name);

    layer.bringToFront();

  };

  const resetHighlight = (e: LeafletMouseEvent) => {
    const layer = e.target;
    const countryCode = layer.feature?.properties?.wb_a2;

    mapStyle.mouseout();

    setMouseoverCountry(null);
    setMouseoverCountryTooltipPosition(undefined);

    layer.setStyle(mapStyle.styleFeature(e.target.feature));
    layer.bringToBack();
  };

  const displayCountryData = async (e: LeafletMouseEvent) => {
    const layer = e.target;
    const countryProp = layer.feature?.properties;
    if (!countryProp) return;

    const countryCode = countryProp.wb_a2.toLowerCase();


    layer.bringToFront(); 

    if (countryCompareStatus == CountryCompareStatus.Selecting) {
      console.log("Country compare requested, origin: " + countryCode);
      setCountryCompareStatus(CountryCompareStatus.Active);
      fetchCountryCompareData(countryCode).then((data) => mapStyle.activateHeatmap({similarities: data, origin: countryCode}));
    } else {
      setSidebarOpen(true);
    }

    const songList = await fetchMusicStats(countryCode, "country_top_tracks");
    const artistList = await fetchMusicStats(countryCode, "country_top_artists");
    const genreList = await fetchMusicStats(countryCode, "country_top_genres");

    // only fires if you select a new country (avoids constantly replaying the same song - don't know if this feature is desirable)
    if (countryCode != selectedCountry?.countryCode) {
      setSelectedCountry({
        countryName: countryProp.name,
        countryCode: countryCode,
        songList,
        artistList,
        genreList,
        streams: "todo"
      });
      console.log(selectedCountry?.countryCode);
    }

    layer.bringToFront();

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
      mouseout: stableResetHighlight,
    });

    const map = useMap();
    map.openTooltip(mouseoverCountry as string, mouseoverCountryTooltipPosition as LatLng, { permanent: true });
  };

  const viewPopularityHeatmap = (date: Date) => {
    if (heatmapSong == null) return
    console.log("viewing popularity heatmap for " + heatmapSong);
    console.log(date);
    heatMapPopularity(date, heatmapSong).then((res) => {
      res.json().then(data => {
        //console.log(data)
        //setFocusOptions({song: undefined, isOpen: false})
        mapStyle.activatePopularityHeatmap(data);
      });
    });
  }

  const geoJsonLayer = <GeoJSON
      data={worldGeoJSON as GeoJSON.GeoJsonObject}
      style={mapStyle.styleFeature} //sets unclicked default style
      onEachFeature={onEachFeature}
      ref={geoJsonRef}
    >
      {selectedCountry && countryCompareStatus == CountryCompareStatus.Disabled && (
        <Popup>
          <strong style={{ fontSize: 20 }}>{selectedCountry.countryName}</strong>
          
          <br/>
          <br/>

          <div className="flex justify-centre">
            <div>
              <ul>
                {selectedCountry.songList.slice(0, 5).map((song: any, index: number) => 
                  <li key={index} style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap"}}>{index + 1}. {song.song_name} </li>
                )}
              </ul>
            </div>
            <div>
              <ul>
                {selectedCountry.songList.slice(0, 5).map((song: any, index: number) => 
                  <li key={index} style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap"}}>&nbsp;- {song.artist}</li>
                )}
              </ul>
            </div>
            
          
          </div>
          <br/>

          <span style={{ fontSize: 14, fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSecondaryPopup("streams", selectedCountry.streams)}>
            Top Artist: {selectedCountry.artistList?.[0]?.artist_name || "N/A"} 
          </span>
          
          <br/>
          <br/>

          <span style={{ fontSize: 14, fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSecondaryPopup("streams", selectedCountry.streams)}>
            Top Genre: {selectedCountry.genreList?.[0]?.genre_name || "N/A"}
          </span>

        </Popup>
      )}

      {popupDetails && ( // for the secondary pop up 
        <Popup>
          <strong>{popupDetails.type.toUpperCase()}</strong><br />
          {popupDetails.value}<br />
          <p>More details about {popupDetails.value}...</p>
          <button onClick={() => setPopupDetails(null)}>Close</button>
        </Popup>
      )}

    </GeoJSON>
  

  return (
    <div id="global">
      <div id="map" className="w-0 h-full fixed top-0 left-0 z-1">
        <TaskBar autocomplete={fetchSearchComplete} />
        <Sidebar isOpen={isSidebarOpen} toggle={sidebarToggleHandler} selectedCountry={selectedCountry} setFocusOptions={setFocusOptions}/>
      </div>

      <div id="map-container" className="flex">
        <MapContainer center={[51.505, -0.09]} zoom={3} style={{ position: "static", top: "0px", left: "0px", "zIndex": "0" }}
          maxBounds={[[85, 180], [-85, -180]]} minZoom={3} maxZoom={5} zoomControl={false}>

          {geoJsonLayer}

          {mouseoverCountry && mouseoverCountryTooltipPosition &&
            (<Marker opacity={0} interactive={false} draggable={false} position={mouseoverCountryTooltipPosition}>
              <Tooltip className='bg-blue-500' direction="bottom" offset={[-15, 17]} permanent>{mouseoverCountry}</Tooltip>
            </Marker> // shows country name on mouseover
            )}
          <button className ="country-compare" onClick={() => {
                if (countryCompareStatus == CountryCompareStatus.Disabled) {
                  setCountryCompareStatus(CountryCompareStatus.Selecting);
                  mapStyle.activateSelecting();
                } else {
                  setCountryCompareStatus(CountryCompareStatus.Disabled);
                  mapStyle.activatePlain();
                }
                //alert("How does one country's music taste compare with the rest of the world's? \nClick a country to see a heatmap animation! ");
              }} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
              {(() => {switch (countryCompareStatus) {
                case CountryCompareStatus.Active: 
                  return "Close country compare"
                case CountryCompareStatus.Selecting:
                  return <>Click a country to compare against<br />Click here again to cancel</>
                case CountryCompareStatus.Disabled:
                  return "Activate country compare"
                }})()}
              </button>          

        </MapContainer>
      </div>
      <HeatmapControl start={new Date(2017, 2, 5)} end={new Date()} viewPopularityHeatmap={viewPopularityHeatmap}/>
      <FocusView focusOptions={focusOptions} setFocusOptions={setFocusOptions} viewPopularityHeatmap={() => {setHeatmapSong(focusOptions.song.song_name)}}></FocusView>
    </div>
  );
}

export default App;
