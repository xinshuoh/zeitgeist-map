import './HeatmapControl.css'
import { useEffect } from 'react';

import { formatDate } from './Util';

interface HeatmapControlProps {
    start: Date,
    end: Date,
    viewPopularityHeatmap: any,
    sliderRef: any
}

export default function HeatmapControl({start, end, viewPopularityHeatmap, sliderRef}: HeatmapControlProps) {
    var days = Math.floor((end.getTime() - start.getTime()) / (1000*60*60*24));
    return <div className="controlbox">
        <input ref={sliderRef} className="heatmapslider" type="range" min="0" max={days} list="timemarks" 
        onChange={e => {
            var queryDate = new Date(start.getTime());
            queryDate.setDate(queryDate.getDate()+parseInt(e.target.value))
            viewPopularityHeatmap(queryDate);
        }}/>
        <datalist className="timemarks" id="timemarks">
          <span>{formatDate(start)}</span>
          <span>{formatDate(end)}</span>
        </datalist>
        <button className="closebutton">Close heatmap</button>
      </div>

}