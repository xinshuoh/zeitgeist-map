import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

const data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface ChartBoxProps {
    isOpen: boolean;
    song: any;
}

const ChartBox = ({isOpen, song}: ChartBoxProps) => {

    return (
    <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                    <PopupComponent 
                    trigger={<button>                    <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                    <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>{song.song_name} - {song.artist}</div> 
                </div></button>} 
                    position="top left"
                    contentStyle={{
                        maxWidth: '600px',
                        width: '90%',
                        height: '80%'
                        }} modal >
          { close => (      
            <div>        
              {song.song_name} - {song.artist}
              <div style={{margin: '10px'}}>  
              <LineChart width={400} height={400} data={data}>
                <Line type="monotone" dataKey="popularity" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <YAxis />
              </LineChart>
              </div>
              <a className="close" onClick={close}>          
                &times;        
              </a>      
            </div>    
          )}  
              </PopupComponent>
                </div>
    );
}

export default ChartBox;