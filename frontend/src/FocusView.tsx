import './FocusView.css';

import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import { useState } from 'react';

import {songCountryHistory} from './Api';

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

    return (      
        <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
        <PopupComponent 
        open={focusOptions.isOpen}
        position="top left"
        contentStyle={{
            maxWidth: '600px',
            width: '90%',
            height: '80%'
            }} modal 
        onOpen={() => {
            console.log(song);
            songCountryHistory(song.song_name).then((v) => {
                v.json().then((d) => {
                    setLineData(d);
                    setViewReady(true);
                });
            }
        )}}
        onClose={() => {
            console.log("Closing")
            setFocusOptions({song: undefined, isOpen: false})
        }}
        >
{ close => {
        return (
<>{viewReady ? <div>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
    <div>
      <strong className="viewHeading">{song? song.song_name : ""}</strong>
      <p className="viewSubheading"><span className="viewLink" onClick={() => close()}>{song? song.artist : ""}</span></p> 
    </div>
    <div className="close" style={{color: "#333"}} onClick={() => {setFocusOptions({song: undefined, isOpen: false})}}>       
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
  <button className="heatmapButton" onClick={viewPopularityHeatmap}>View heatmap</button>
</div>   : <p>Loading data...</p>}</>  
)}}  
  </PopupComponent>
    </div>   
          )}

export default FocusView;