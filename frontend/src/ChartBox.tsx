import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import FocusView from './FocusView';

const data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface ChartBoxProps {
    isOpen: boolean;
    song: any;
}

const ChartBox = ({isOpen, song}: ChartBoxProps) => {

    return <FocusView song={song} trigger={
      
      <button className={`inset-0 w-full h-full`}>                    
        
        <div className={`bg-transparent rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>
          <div className="text-lg font-bold">{song.song_name}</div>
          <div className="text-sm text-gray-700">{song.artist}</div>
      
        </div> 
      
      </button>
    }></FocusView>
}

export default ChartBox;