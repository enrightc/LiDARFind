// Credit: https://leafletjs.com/

// Initialize the map on the create record page
var map = L.map('mapid').setView([52.4814, -3.9797], 8);

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


// Variable to store the current marker
let currentMarker = null;

// Add event listener to the map to retrieve coordinates and populate input field on form
map.on('click', function(e) {
    // Get the clicked coordinates
    const coords = e.latlng;

    // Update the input field with the coordinates
    document.getElementById('location').value = `${coords.lat}, ${coords.lng}`;

    // Check if there is an existing marker and remove it
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create a new marker at the clicked coordinates
    currentMarker = L.marker(coords).addTo(map);

    // When the marker is clicked, center the map on the marker's location and zoom to level 14
    // Adapted from https://developers.google.com/maps/documentation/javascript/examples/event-simple
    currentMarker.on('click', function() {
        map.setView(currentMarker.getLatLng(), 14); // Zoom to level 14 and center on the new marker
    });
});

// Layer control to toggle between layers
var baseMaps = {
    "OpenStreetMap": openStreetMap,
    "Bing Satellite": bingSatellite
};

var overlayMaps = {
    "LiDAR Data": wmsLayer
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(map);
