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
      <button>                    
        <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
        <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>{song.song_name} - {song.artist}</div> 
      </div></button>
    }></FocusView>
}

export default ChartBox;