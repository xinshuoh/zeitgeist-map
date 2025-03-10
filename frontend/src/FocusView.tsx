import './FocusView.css';

import { useState } from 'react';

import { Popup as PopupComponent } from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import { artistCountryHistory, songCountryHistory } from './Api';

import PopularityLineChart from './PopularityLineChart'

var data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface FocusViewProps {
    focusOptions: any;
    setFocusOptions: any;
    viewPopularityHeatmap: any;
}

const FocusView = ({focusOptions, setFocusOptions, viewPopularityHeatmap}: FocusViewProps) => {

    const [viewReady, setViewReady] = useState<boolean>(false);
    const [lineData, setLineData] = useState<any>([]);

  let song = focusOptions.song;
  let artist = focusOptions.artist;

  return (      
    <div>
      <PopupComponent 
        open = {focusOptions.isOpen}
        position = "top left"
        contentStyle = {{
          maxWidth: '1000px',
          width: '100%',
          height: '75%'
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
              <div style={{ margin: "15px"}}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "15px", width: "100%"}}>
                  <div>
                    {/* Display a FocusView for either songs or artists */}

                    {/* Display a header for both songs and artists */}
                    <strong className="viewHeading">{song ? song.song_name : artist}</strong>
                    
                    {/* Display a link to the artist for songs */}
                    <p className="viewSubheading">
                      <span className="viewLink" onClick={() => {
                        setFocusOptions({isOpen: true, song: undefined, artist: song.artist});

                        artistCountryHistory(song.artist).then((v) => {
                          v.json().then((d) => {
                            setLineData(d);
                            setViewReady(true);
                          });
                        })
                      }}>
                        {song ? song.artist : ""}
                      </span>
                    </p> 
                  </div>
                  <div className="close" style={{color: "#333"}} onClick={() => close()}>       
                    &times;         
                  </div> 
                </div>

                <div className="graph-container">
                  {/* <LineChart width={500} height={200} data={lineData}>
                    <Line type="monotone" dataKey="popularity" stroke="#8884d8" strokeWidth={3} dot={false} isAnimationActive={false}/>
                    <CartesianGrid style={{backgroundColor: "#d6b8c3"}} stroke="#ccc" />
                    <YAxis />
                  </LineChart> */}
                  {song ? <PopularityLineChart lineData={lineData} song={song} artist_name={""}/> : <PopularityLineChart lineData={lineData} song={undefined} artist_name={artist}/>}
                </div> 

                <button className="heatmapButton" onClick={viewPopularityHeatmap}>View heatmap</button>
              </div> : <p>Loading data...</p>
            }
          </>
        )}}  
      </PopupComponent>
    </div>   
  )
}

export default FocusView;