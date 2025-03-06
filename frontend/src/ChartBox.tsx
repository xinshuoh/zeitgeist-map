import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

const data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface ChartBoxProps {
    isOpen: boolean;
    song: any;
}

const ChartBox = ({isOpen, song}: ChartBoxProps) => {

    return <div>
      <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center" style={{ backgroundColor: '#d6b8c3' }}><button className={`inset-0 w-full h-full`}>                    
        
        <div className={`bg-transparent rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>
          <div className="text-lg font-bold">{song.song_name}</div>
          <div className="text-sm" style={{ color: "#361836" }}>{song.artist}</div>
      
        </div> 
      
      </button></div>
      
    </div>
}

export default ChartBox;