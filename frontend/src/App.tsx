import { useState } from 'react'
import './App.css'
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import worldGeoJSON from './assets/worldmap_med.json'

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
}  

const styleFeature = (feature: any) => ({
  fillColor: getColor(feature.properties.pop_est || 0), // Default to 0 if no density field
  weight: 1,
  color: 'white',
  fillOpacity: 0.7
});

const fetchMusicStats = async (countryName: string) => {
  return {country: countryName, topArtist: "Example Artist", genre: "Pop", streams: "10M+" };
};

const onEachFeature = (feature: any, layer: any) => {
  layer.on('click', async (event: any) => {
    const countryName = feature.properties.name;
    const musicData = await fetchMusicStats(countryName);
    
    const popupContent = `
      <strong>${countryName}</strong><br />
      Top Artist: ${musicData.topArtist}<br />
      Genre: ${musicData.genre}<br />
      Streams: ${musicData.streams}
    `;
    
    layer.bindPopup(popupContent).openPopup(event.latlng);
  });
};

function App() {

  return (
    <>
      <div id="map">
        <MapContainer center={[51.505, -0.09]} zoom={3} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON data={worldGeoJSON as GeoJSON.GeoJsonObject} style={styleFeature} onEachFeature={onEachFeature}/>
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
    </>
  )
}

export default App
