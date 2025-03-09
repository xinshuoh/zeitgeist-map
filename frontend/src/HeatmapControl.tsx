import './HeatmapControl.css';
import { useEffect, useRef } from 'react';
import { formatDate } from './Util';

interface HeatmapControlProps {
    start: Date;
    end: Date;
    viewPopularityHeatmap: (date: Date) => void;
    sliderRef: React.RefObject<HTMLInputElement>;
    close: () => void;
}

export default function HeatmapControl({ start, end, viewPopularityHeatmap, sliderRef, close }: HeatmapControlProps) {
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const localSliderRef = useRef<HTMLInputElement>(null); // Use local ref if needed

    // Function to update slider background dynamically
    function updateSliderBackground(e: React.ChangeEvent<HTMLInputElement>) {
        const slider = e.target;
        const value = Number(slider.value);
        const percent = (value / days) * 100;

        // Apply dynamic gradient
        slider.style.background = `linear-gradient(to right, #8b8b8b 0%, #8b8b8b ${percent}%,#cacaca ${percent}%,#cacaca  100%)`;

        // Update heatmap view
        const queryDate = new Date(start.getTime());
        queryDate.setDate(queryDate.getDate() + value);
        viewPopularityHeatmap(queryDate);
    }

    return (
        <div className="controlbox">
            <input
                ref={sliderRef || localSliderRef}
                className="heatmapslider"
                type="range"
                min="0"
                max={days.toString()}
                list="timemarks"
                onInput={updateSliderBackground} // Dynamically change background
            />
            <datalist className="timemarks" id="timemarks">
                <span>{formatDate(start)}</span>
                <span>{formatDate(end)}</span>
            </datalist>
            <button className="closebutton" onClick={close}>Close heatmap</button>
        </div>
    );
}
