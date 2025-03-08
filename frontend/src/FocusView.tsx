import './FocusView.css';

import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import { useState } from 'react';

import {songCountryHistory} from './Api';

var data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface FocusViewProps {
    focusOptions: any;
    setFocusOptions: any;
}

const FocusView = ({focusOptions, setFocusOptions}: FocusViewProps) => {
  const [viewReady, setViewReady] = useState<boolean>(false);
  const [lineData, setLineData] = useState<any>([]);

  let song = focusOptions.song;
  let artist = focusOptions.artist;

  return (      
    <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
      <PopupComponent 
        open = {focusOptions.isOpen}
        position = "top left"
        contentStyle = {{
          maxWidth: '600px',
          width: '90%',
          height: '80%'
        }} 
        modal 
        onOpen = {() => {
          console.log(song);
          songCountryHistory(song.song_name).then((v) => {
            v.json().then((d) => {
              setLineData(d);
              setViewReady(true);
            });
          });
        }}
        onClose = {() => {
          console.log("Closing");
          setFocusOptions({song: undefined, artist: undefined, isOpen: false});
        }}
      >
        { close => { return (
          <>
            {
              viewReady ? 
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "10px"}}>
                  <div>
                    {/* Display a FocusView for a song */}
                    <strong className="viewHeading">{song ? song.song_name : ""}</strong>
                    <p className="viewSubheading">
                      <span className="viewLink" onClick={() => {
                        setFocusOptions({isOpen: true, song: undefined, artist: song.artist});
                      }}>
                        {song? song.artist : ""}
                      </span>
                    </p> 

                    {/* Display a FocusView for an artist */}
                    <strong className="viewHeading">{artist ? artist : ""}</strong>
                  </div>
                  <div className="close" style={{color: "#333"}} onClick={() => close()}>       
                    &times;         
                  </div> 
                </div>

                <div className="graph-container">
                  <LineChart width={500} height={200} data={lineData}>
                    <Line type="monotone" dataKey="popularity" stroke="#8884d8" strokeWidth={3} dot={false} isAnimationActive={false}/>
                    <CartesianGrid style={{backgroundColor: "#d6b8c3"}} stroke="#ccc" />
                    <YAxis />
                  </LineChart>
                </div> 

                <button className="heatmapButton">View heatmap</button>
              </div> : <p>Loading data...</p>
            }
          </>
        )}}  
      </PopupComponent>
    </div>   
  )
}

export default FocusView;