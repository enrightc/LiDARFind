// Initialize the map
var map = L.map('user-profile-map').setView([52.4814, -3.9797], 8);

// Base Map Layer: OpenStreetMap
var openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Bing Maps Satellite Layer
/*
var bingSatellite = new L.BingLayer('AjH7Kmd8nydYW5bYUgAmdOD0g7hZzlMdu5tlFLvVT8oCT-n-CeUQLRutNJJXLhpY', {
    type: 'Aerial'  // Use 'AerialWithLabels' if you want satellite images with labels
});
*/

// Adding the WMS layer for LiDAR DSM (hillshade) data
var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", { // Base URL to the OWS endpoint
    layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
});

// Make a request to the Flask route to get the user's site locations and display markers on map
// Adapted from https://github.com/isntlee/Sagacity/blob/master/app.py
fetch("/fetch_user_locations")
    .then(response => response.json())
    .then(data => {
        // Iterate through the location data and add markers to the map
        data.forEach(location => {
            const [lat, lng] = location.split(',').map(parseFloat);
            L.marker([lat, lng]).addTo(map);
        });
    })