import './FocusView.css';

import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import { useState } from 'react';

var data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface FocusViewProps {
    trigger: any;
    song: any;
}

const FocusView = ({trigger,song,}: FocusViewProps) => {

    const [viewReady, setViewReady] = useState<boolean>(false);
    const [lineData, setLineData] = useState<any>([]);

    return (      
        <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
        <PopupComponent 
        trigger={trigger} 
        position="top left"
        contentStyle={{
            maxWidth: '600px',
            width: '90%',
            height: '80%'
            }} modal 
        onOpen={() => {
            const res = fetch(`http://127.0.0.1:5000/song_country_history?country_code=${'gb'}&song_name=${song.song_name}`)
            res.then((v) => {
                v.json().then((d) => {
                    setLineData(d);
                    setViewReady(true);
                });
            })
        }}>
{ close => {
        return (
<>{viewReady ? <div>
    <a className="close" onClick={close}>          
    &times;        
  </a> 
    <h2 className="viewHeading">{song.song_name}</h2>
    <p className="viewSubheading">By <span className="viewLink" onClick={() => close()}>{song.artist}</span></p>
  <div style={{margin: '10px'}}>
  <LineChart width={500} height={200} data={lineData}>
    <Line type="monotone" dataKey="popularity" stroke="#8884d8" strokeWidth={3} dot={false}/>
    <CartesianGrid stroke="#ccc" />
    <YAxis />
  </LineChart>
  </div>   
  <button className="heatmapButton">View heatmap</button>
</div>   : <p>Loading data...</p>}</>  
)}}  
  </PopupComponent>
    </div>   
          )}

export default FocusView;