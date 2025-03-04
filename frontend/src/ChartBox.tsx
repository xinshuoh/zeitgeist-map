import {Popup as PopupComponent} from 'reactjs-popup';

import { LineChart, Line, CartesianGrid, YAxis } from 'recharts';

import FocusView from './FocusView';

const data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface ChartBoxProps {
    isOpen: boolean;
    song: any;
}

const ChartBox = ({isOpen, song}: ChartBoxProps) => {

    return <p>FocusBox</p>
}

export default ChartBox;