import polylabel from "polylabel";
import { geoArea } from "d3-geo"
import * as fs from "fs";
import { Feature } from 'geojson';

const filePath = "./assets/worldmap_large_new.json";
const geojson: { features: Feature[] } = JSON.parse(fs.readFileSync("./assets/worldmap_large.json", "utf8"));
console.log("Processing", geojson.features.length, "features");

geojson.features.forEach((feature: Feature) => {
    const centre = findPolylabel(feature);
    console.log(`Centre of feature ${feature.properties?.formal_en}:`, centre);
});

geojson.features.forEach((feature: Feature) => {
    const centre = findPolylabel(feature);
    
    if (centre) {
        // Add computed center to feature properties
        feature.properties = {
            ...feature.properties,
            centre_lng: centre[0],  // Longitude
            centre_lat: centre[1],  // Latitude
        };
        console.log(`Centre of feature ${feature.properties?.formal_en}:`, centre);
    }
});

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(geojson, null, 2), "utf8");
console.log("Updated GeoJSON file saved.");

export default function findPolylabel(feature: Feature) {
    let output: (number[] & { distance: number; }) = [0, 0] as (number[] & { distance: number; });
    if (feature.geometry.type === "Polygon") {
        output = polylabel(feature.geometry.coordinates);
    }
    else if (feature.geometry.type === "MultiPolygon") {
        let maxArea = 0, maxPolygon: number[][][] = [];
        for (let i = 0, l = feature.geometry.coordinates.length; i < l; i++) {
            const p = feature.geometry.coordinates[i];
            const area = geoArea({ type: "Polygon", coordinates: p })
            if (area > maxArea) {
                maxPolygon = p;
                maxArea = area;
            }
        }
        output = polylabel(maxPolygon);
    } 
    return output;
}