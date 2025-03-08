import {useState} from 'react';
import 'leaflet/dist/leaflet.css';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';

enum MapMode {
    Plain,
    Heatmap,
    Selecting,
    PopularityHeatmap
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
        geoJsonRef.current.resetStyle();
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
                    weight: 2,
                    color: '#d0d0d0',
                    fillOpacity: 0.8
                  });

            case MapMode.Heatmap:
                if (heatmapData?.origin === feature?.properties?.wb_a2.toLowerCase()) 
                    return { fillColor: '#000033', fillOpacity: 1, weight: 1, color: '#361836' };
                const similarity = heatmapData?.similarities.find((c:any) => c.country_code === feature?.properties?.wb_a2.toLowerCase())?.similarity ?? 0;
                const ccolor = `rgba(255, 0, 0)`;
                return { fillColor: ccolor, fillOpacity: similarity, weight: 1, color: '#361836' };
    

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
                    const ccolor = `rgba(255, 0, 0)`;
                    return { fillColor: ccolor, fillOpacity: v, weight: 1, color: '#361836' };
                } else                 return ({
                    fillColor: getColor(feature?.properties?.pop_est || 0),
                    weight: 2,
                    color: '#888888',
                    fillOpacity: 0.8
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
        mouseout
    };
}

