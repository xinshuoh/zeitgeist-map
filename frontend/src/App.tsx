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

export enum CountryCompareStatus {
  Disabled,
  Selecting,
  Active
}

enum PopularityHeatmapStatus {
  Disabled,
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
  const [focusOptions, setFocusOptions] = useState<FocusOptions>({ song: undefined, artist: undefined, isOpen: false });
  const [heatmapSong, setHeatmapSong] = useState<string | null>(null);

  const [countryCompareStatus, setCountryCompareStatus] = useState<CountryCompareStatus>(CountryCompareStatus.Disabled);
  const [popularityHeatmapStatus, setPopularityHeatmapStatus] = useState<PopularityHeatmapStatus>(PopularityHeatmapStatus.Disabled);
  
  const [forceRenderKey, setForceRenderKey] = useState(0);

  const sidebarToggleHandler = () => {
    setSidebarOpen(curr => !curr);
  }

  const geoJsonRef = useRef<any | null>(null);
  const mapStyle = mapStyler(geoJsonRef);


  // hacky fix to issue on startup - load an empty country
  useEffect(() => { 
    setSelectedCountry({
      countryName: 'loading...',
      countryCode: 'loading...',
      songList: [],
      artistList: [],
      genreList: [],
      streams: "todo"
    });
  }, []);

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

    mapStyle.mouseout();

    setMouseoverCountry(null);
    setMouseoverCountryTooltipPosition(undefined);

    layer.setStyle(mapStyle.styleFeature(e.target.feature));
    layer.bringToBack();
  };

  const displayCountryData = async (e: LeafletMouseEvent) => {
    // get the layer and bring it to front straight away
    const layer = e.target;
    layer.bringToFront();

    // extract the country code
    const countryProp = layer.feature?.properties;
    if (!countryProp) return;
    const countryCode = countryProp.wb_a2.toLowerCase();  

    // set the selected country - with all the relevant data
    // only fires if you select a new country 
    if (countryCode != selectedCountry?.countryCode) {
      const songList = await fetchMusicStats(countryCode, "country_top_tracks");
      const artistList = await fetchMusicStats(countryCode, "country_top_artists");
      const genreList = await fetchMusicStats(countryCode, "country_top_genres");
      
      setSelectedCountry({
        countryName: countryProp.name,
        countryCode: countryCode,
        songList: songList,
        artistList: artistList,
        genreList: genreList,
        streams: "todo"
      });

      // setForceRenderKey(prev => prev + 1);
    }

    // opens the correct thing, but with selected country already set
    if (countryCompareStatus == CountryCompareStatus.Selecting) {
      console.log("Country compare requested, origin: " + countryCode);
      setCountryCompareStatus(CountryCompareStatus.Active);
      fetchCountryCompareData(countryCode).then((data) => mapStyle.activateHeatmap({ similarities: data, origin: countryCode }));
    } else {
      setSidebarOpen(true);
    }

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

  const viewPopularityHeatmap = (date: Date, song_name: string | undefined) => {
    var song = song_name || heatmapSong;
    if (!song) return;
    heatMapPopularity(date, song).then((res) => {
      res.json().then(data => {
        mapStyle.activatePopularityHeatmap(data);
      });
    });
  }
  const HeatmapLegend = ({ countryCompareStatus }: { countryCompareStatus: CountryCompareStatus }) => {
    const map = useMap();
  
    useEffect(() => {
      if (countryCompareStatus !== CountryCompareStatus.Active) {
        return; 
      }
  
      const indexColor = [
        '#FFCCCC',// Very light red (Low similarity)
        '#FFAAAA',
        '#FF6666',
        '#FF4444',
        '#FF0000',
        '#D50000',
        '#AA0000',  // Dark red (High similarity)
      ];

      const legend = new L.Control({ position: "bottomright" });

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "heatmap-legend");
        div.innerHTML = `
          <div style="background: white; padding: 8px; border-radius: 5px; font-size: 12px; color:black; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <strong>Similarity Index</strong>
            <div style="margin-top: 5px;">
              ${indexColor.map((color, index) => `
                <div style="display: flex; align-items: center; margin-top: 5px;">
                  <span style="background: ${color}; width: 20px; height: 10px; display: inline-block; margin-right: 5px;"></span> 
                  ${getLabelForIndex(index)}
                </div>
              `).join('')}
            </div>
          </div>
        `;
        return div;
      };
  
      legend.addTo(map);
  
      return () => {
        legend.remove();
      };
    }, [map, countryCompareStatus]);

    const getLabelForIndex = (index: number) => {
      if (index === 0) {
        return 'Very Low';
      } else if (index === 6) {
        return 'Very High';
      }
      return index < 7 / 2 ? 'Low' : 'High';
    };

    return null;
};

  
  const geoJsonLayer = <GeoJSON
    data={worldGeoJSON as GeoJSON.GeoJsonObject}
    style={mapStyle.styleFeature} //sets unclicked default style
    onEachFeature={onEachFeature}
    ref={geoJsonRef}
  >
    {selectedCountry && countryCompareStatus == CountryCompareStatus.Disabled && popularityHeatmapStatus == PopularityHeatmapStatus.Disabled && (
      <Popup>
        <strong style={{ fontSize: 20 }}>{selectedCountry.countryName}</strong>

        <br />
        <br />

        <div className="flex justify-centre">
          <div>
            <ul>
              {selectedCountry.songList.slice(0, 5).map((song: any, index: number) =>
                <li key={index} style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap" }}>{index + 1}. {song.song_name} </li>
              )}
            </ul>
          </div>
          <div>
            <ul>
              {selectedCountry.songList.slice(0, 5).map((song: any, index: number) =>
                <li key={index} style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap" }}>&nbsp;- {song.artist}</li>
              )}
            </ul>
          </div>


        </div>
        <br />

        <span style={{ fontSize: 14, fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSecondaryPopup("streams", selectedCountry.streams)}>
          Top Artist: {selectedCountry.artistList?.[0]?.artist_name || "unknown"}
        </span>

        <br />
        <br />

        <span style={{ fontSize: 14, fontWeight: "bold", cursor: "pointer" }} onClick={() => handleSecondaryPopup("streams", selectedCountry.streams)}>
          Top Genre: {selectedCountry.genreList?.[0]?.genre_name || "unknown"}
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

  const sliderRef = useRef<any | null>(null);

  useEffect(() => {
    if (sliderRef.current) sliderRef.current.value = sliderRef.current.max;
  }, [popularityHeatmapStatus]);


  return (
    <div id="global">
      <div id="map" className="w-0 h-full fixed top-0 left-0 z-1">

        <TaskBar
          autocomplete={fetchSearchComplete}
          setFocusOptions={setFocusOptions}
          countryCompareStatus={countryCompareStatus}
          setHelpOptions={undefined}
          onCountryCompare={() => {
            if (countryCompareStatus == CountryCompareStatus.Disabled) {
              setPopularityHeatmapStatus(PopularityHeatmapStatus.Disabled);
              setCountryCompareStatus(CountryCompareStatus.Selecting);
              mapStyle.activateSelecting();
            } else {
              setCountryCompareStatus(CountryCompareStatus.Disabled);
              mapStyle.activatePlain();
            }
          } }  />
        <Sidebar isOpen={isSidebarOpen} toggle={sidebarToggleHandler} selectedCountry={selectedCountry} setFocusOptions={setFocusOptions} />

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

        <HeatmapLegend countryCompareStatus={countryCompareStatus} />

        </MapContainer>
      </div>
      {popularityHeatmapStatus == PopularityHeatmapStatus.Active && <HeatmapControl start={new Date(2017, 2, 5)} end={new Date()} viewPopularityHeatmap={viewPopularityHeatmap} sliderRef={sliderRef}
        close={() => {
          setPopularityHeatmapStatus(PopularityHeatmapStatus.Disabled);
          mapStyle.activatePlain();
        }} />}
        {popularityHeatmapStatus == PopularityHeatmapStatus.Active && (
            <div style={{ position: 'absolute', top: '10%', left: '40%', backgroundColor: '#361836', padding: '5px', borderRadius: '5px', zIndex: 1000 }}>
            Popularity Heat Map for: {heatmapSong}
            </div>
        )}

      <FocusView focusOptions={focusOptions} setFocusOptions={setFocusOptions} viewPopularityHeatmap={() => {
        setHeatmapSong(focusOptions.song.song_name);
        setFocusOptions({ song: undefined, artist: undefined, isOpen: false });
        setSidebarOpen(false);
        setPopularityHeatmapStatus(PopularityHeatmapStatus.Active);
        setCountryCompareStatus(CountryCompareStatus.Disabled);
        viewPopularityHeatmap(new Date(), focusOptions.song.song_name);
      }}></FocusView>
    </div>
  );
}

export default App;
