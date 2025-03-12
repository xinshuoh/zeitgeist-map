import {useState} from 'react';
import 'leaflet/dist/leaflet.css';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { set } from 'date-fns';

enum MapMode {
    Plain,
    Heatmap,
    Selecting,
    PopularityHeatmap,
    SMHHeatmap,
}

type CountrySimilarityData = {
    country_code: string;
    name: string;
    similarity: number;
  }

type CountryCompareData = {
    similarities: CountrySimilarityData[];
    origin: string;
}

type PopularityData = any

export default function mapStyler(geoJsonRef: any) {
    const [mapMode, setMapMode] = useState<MapMode>(MapMode.Plain);
    const [heatmapData, setHeatmapData] = useState<CountryCompareData | undefined>(undefined);
    const [popularityData, setPopularityData] = useState<PopularityData | undefined>(undefined);
    const [mouseoverFeature, setMouseoverFeature] = useState<any>(undefined);

    const getColor = (_population: any) => '#FFFFFF';

    function activateHeatmap(data: CountryCompareData) {
        setHeatmapData(data);
        setMapMode(MapMode.Heatmap);
        geoJsonRef.current.resetStyle();
    }

    function activatePopularityHeatmap(data: PopularityData) {
        setPopularityData(data);
        setMapMode(MapMode.PopularityHeatmap);
        //geoJsonRef.current.resetStyle();
    }

    function activateSMHHeatmap(data: PopularityData) {
        setPopularityData(data);
        setMapMode(MapMode.SMHHeatmap);
        geoJsonRef.current.resetStyle(); // doesn't seem to work...
    }

    function activateSelecting() {
        setMapMode(MapMode.Selecting);
        geoJsonRef.current.resetStyle();
    }

    function activatePlain() {
        setMapMode(MapMode.Plain);
        geoJsonRef.current.resetStyle();
    }

    function styleFeature(feature: Feature<Geometry, GeoJsonProperties> | undefined) {
        if (mouseoverFeature != undefined) {
            if (feature === mouseoverFeature)
                return ({
                    weight: 1,
                    color: '#361836',
                    dashArray: '',
                    fillOpacity: 0.5,
                  });
        }

        switch (mapMode) {

            case MapMode.Plain:
                return ({
                    fillColor: getColor(feature?.properties?.pop_est || 0),
                    weight: 1,
                    color: '#d0d0d0',
                    fillOpacity: 0.8
                  });

    //         case MapMode.Heatmap:
    //             if (heatmapData?.origin === feature?.properties?.wb_a2.toLowerCase()) 
    //                 return { fillColor: '#361836', fillOpacity: 1, weight: 1, color: '#361836' };
    //             const similarity = heatmapData?.similarities.find((c:any) => c.country_code === feature?.properties?.wb_a2.toLowerCase())?.similarity ?? 0;
    //             const ccolor = `rgba(255, 0, 0)`;
    //             console.log(feature?.properties?.wb_a2.toLowerCase(), similarity);
    //             if (similarity === 0) {
    //                 return { fillColor: '#FFFFFF', fillOpacity: 1, weight: 1, color: '#d0d0d0' };
    //             }
    //             return { fillColor: ccolor, fillOpacity: 5* similarity, weight: 1, color: '#d0d0d0' };

            case MapMode.Heatmap:
                if (heatmapData?.origin === feature?.properties?.wb_a2.toLowerCase()) {
                    return { fillColor: '#361836', fillOpacity: 1, weight: 1, color: '#361836' };
                }
                const similarity = heatmapData?.similarities.find((c: any) => c.country_code === feature?.properties?.wb_a2.toLowerCase())?.similarity ?? 0;
                // const indexColor = [
                //     '#FFCCCC',// Very light red (Low similarity)
                //     '#FFAAAA',
                //     '#FF6666',
                //     '#FF4444',
                //     '#FF0000',
                //     '#D50000',
                //     '#AA0000',  // Dark red (High similarity)
                // ];
                const indexColor = [
                    '#E2DBE2', // Very light purple (Low similarity)
                    '#C5B6C5',
                    '#A892A8',
                    '#8A6D8A',
                    '#6D496D',
                    '#502450',
                    '#330033' // Dark purple (High similarity)
                  ];
                if (similarity === 0) {
                    return { fillColor: '#FFFFFF', fillOpacity: 1, weight: 1, color: '#d0d0d0' };
                }
                const colorIndex = Math.min(Math.floor(3 * similarity * indexColor.length), indexColor.length - 1);
                const fillColor = indexColor[colorIndex];

            return { fillColor, fillOpacity: 1, weight: 1, color: '#d0d0d0' };


            case MapMode.Selecting:
                return ({
                    fillColor: getColor(feature?.properties?.pop_est || 0),
                    weight: 2,
                    color: '#bbbbbb',
                    dashArray: '3,8',
                    fillOpacity: 0.8
                  });

            case MapMode.PopularityHeatmap:
                if (popularityData && feature?.properties?.wb_a2.toLowerCase() in popularityData) {
                    const v = (200-popularityData[feature?.properties?.wb_a2.toLowerCase()])/199;
                    const ccolor = `#330033`;
                    return { fillColor: ccolor, fillOpacity: v, weight: 1, color: '#d0d0d0' };
                } else                 return ({
                    fillColor: getColor(feature?.properties?.pop_est || 0),
                    weight: 1,
                    color: '#d0d0d0',
                  });

            case MapMode.SMHHeatmap:
                if (popularityData && feature?.properties?.wb_a2.toLowerCase() in popularityData) {
                    let k = Object.values<number>(popularityData);
                    const m = Math.max(...k);
                    const v = (popularityData[feature?.properties?.wb_a2.toLowerCase()])/m;
                    const ccolor = `#330033`;
                    return { fillColor: ccolor, fillOpacity: v, weight: 1, color: '#d0d0d0' };
                } else                 return ({
                    fillColor: getColor(feature?.properties?.pop_est || 0),
                    weight: 1,
                    color: '#d0d0d0',
                  });
        }
    }

    function mouseover(feature: any) {
        setMouseoverFeature(feature);
    }

    function mouseout() {
        setMouseoverFeature(undefined);
    }

    return {
        styleFeature, 
        activateHeatmap, 
        activateSelecting,
        activatePlain,
        activatePopularityHeatmap,
        mouseover, 
        mouseout,
        activateSMHHeatmap
    };
}

