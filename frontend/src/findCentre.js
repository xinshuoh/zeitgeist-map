"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = findPolylabel;
var polylabel_1 = require("polylabel");
var d3_geo_1 = require("d3-geo");
var fs = require("fs");
console.log("hi");
var geojson = JSON.parse(fs.readFileSync("./assets/worldmap_large.json", "utf8"));
console.log("Processing", geojson.features.length, "features");
geojson.features.forEach(function (feature) {
    var centre = findPolylabel(feature);
    console.log("Centre of feature ".concat(feature.properties.formal_en, ":"), centre);
});
function findPolylabel(feature) {
    var output = [];
    if (feature.geometry.type === "Polygon") {
        output = (0, polylabel_1.default)(feature.geometry.coordinates);
    }
    else {
        var maxArea = 0, maxPolygon = [];
        for (var i = 0, l = feature.geometry.coordinates.length; i < l; i++) {
            var p = feature.geometry.coordinates[i];
            var area = (0, d3_geo_1.geoArea)({ type: "Polygon", coordinates: p });
            if (area > maxArea) {
                maxPolygon = p;
                maxArea = area;
            }
        }
        output = (0, polylabel_1.default)(maxPolygon);
    }
    return output;
}
