const fs = require('fs');
const { feature } = require('topojson-client');

// Read the TopoJSON file
const topoData = JSON.parse(fs.readFileSync('./data/us-states-clean.json', 'utf8'));

// Convert to GeoJSON
const statesGeoJSON = feature(topoData, topoData.objects.states);

// Write the converted GeoJSON
fs.writeFileSync('./data/us-states-final.json', JSON.stringify(statesGeoJSON, null, 2));

console.log('TopoJSON converted to GeoJSON successfully!');
console.log(`States found: ${statesGeoJSON.features.length}`);

// Log a few state names to verify
const stateNames = statesGeoJSON.features.slice(0, 10).map(f => f.properties.name);
console.log('First 10 states:', stateNames);
