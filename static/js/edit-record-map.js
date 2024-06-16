document.addEventListener("DOMContentLoaded", function() {
    // Get the record location 
    const recordLocation = document.getElementById('location').value;
    const [lat, lng] = recordLocation.split(',').map(parseFloat);

    // Initialize the map centered on the record location
    var map = L.map('edit-record-map').setView([lat, lng], 14);

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
    var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", {
        layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
    });

    // Add the marker for the record being edited
    var marker = L.marker([lat, lng]).addTo(map);

    // Variable to store the current marker
    let currentMarker = marker;

    // Add click event listener to the map to place a new marker
    map.on('click', function(e) {
        var coords = e.latlng;

        // Update the input field with the coordinates
        document.getElementById('location').value = `${coords.lat}, ${coords.lng}`;

        // Check if there is an existing marker and remove it
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Create a new marker at the clicked coordinates
        currentMarker = L.marker(coords).addTo(map);
    });

// Layer control to toggle between layers
var baseMaps = {
    "OpenStreetMap": openStreetMap,
    "Bing Satellite": bingSatellite
};

var overlayMaps = {
    "LiDAR Data": wmsLayer
};

    L.control.layers(baseMaps, overlayMaps).addTo(map);
});
