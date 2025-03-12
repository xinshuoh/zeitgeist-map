import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import './ChartBox.css'

const data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface ChartBoxProps {
    isOpen: boolean;
    song: any;
    artist: any;
}

const ChartBox = ({isOpen, song, artist}: ChartBoxProps) => {

    return <div>
      <div className="bg-transparent w-[300px] rounded-lg shadow-md flex items-center justify-center" style={{ backgroundColor: '#fff' }}><button className={`songButton inset-0 w-full h-full`}>                    
        
        <div className={`buttonOverlay rounded-lg h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`} style={{backgroundColor: '#fff'}}>
          {song ? 
            <div>
              <div className="text-lg font-bold" style={{ color: '#330033' }}>{song.song_name}</div>
              <div className="text-sm" style={{ color: "#361836" }}>{song.artist}</div>
            </div>
            :
            <div className="text-lg font-bold" style={{ color: '#330033' }}>{artist.artist_name}</div>
          }
          
      
        </div> 
      
      </button></div>
      
    </div>
}

export default ChartBox;