/*jshint esversion: 6 */
/* global L */

document.addEventListener("DOMContentLoaded", function() {
    // Get the existing location from the record
    const recordLocation = document.getElementById('location').value;
    const [lat, lng] = recordLocation.split(',').map(parseFloat);

    // Define the bounds for Wales
    // Source: https://stackoverflow.com/questions/22155017/can-i-prevent-panning-leaflet-map-out-of-the-worlds-edge
    const walesBounds = L.latLngBounds(
        L.latLng(51.3776, -5.5590), // Southwest corner of Wales
        L.latLng(53.4308, -2.6800)  // Northeast corner of Wales
    );

    // Initialize the map centered on the record location
    var map = L.map('edit-record-map', {
        center: [lat, lng],
        zoom: 14,
        minZoom: 8,
        maxBounds: walesBounds, // Set the map bounds to Wales
        maxBoundsViscosity: 1.0, // Prevent panning outside the bounds
        // leaflet loader source: https://github.com/ebrelsford/Leaflet.loading?tab=readme-ov-file
        // Tell the map to use a loading control
        loadingControl: true
    });

    // Base Map Layer: OpenStreetMap
    var openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Welsh Langage map
    var welshMap = L.tileLayer('https://openstreetmap.cymru/osm_tiles/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href=”https://www.openstreetmap.cymru” target=”_blank”>openstreetmap.cymru</a>. Data ar y map &#x24BD Cyfranwyr <a href=”https://openstreetmap.org” target=”_blank”>osm.org</a>'
    }).addTo(map);

    //Bing Maps Satellite Layer
    var bingSatellite = new L.BingLayer('AjH7Kmd8nydYW5bYUgAmdOD0g7hZzlMdu5tlFLvVT8oCT-n-CeUQLRutNJJXLhpY', {
        type: 'Aerial'  // Use 'AerialWithLabels' if you want satellite images with labels
    });

    // Adding the WMS layer for LiDAR DSM (hillshade) data
    var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", {
        layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
        attribution: '&copy; <a href="">DataMap Wales</a>'
    });

    // Add the marker for the record being edited
    var marker = L.marker([lat, lng]).addTo(map);

    // Variable to store the current marker
    let currentMarker = marker;

    // Add click event listener to the map to place a new marker
    map.on('click', function(e) {
        var coords = e.latlng;

        // Update the input field with the coordinates
        document.getElementById('location').value = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

        // Check if there is an existing marker and remove it
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Create a new marker at the clicked coordinates
        currentMarker = L.marker(coords).addTo(map);
    });

    // Layer control to toggle between base maps and overlays
    var baseMaps = {
        "OpenStreetMap": openStreetMap,
        "Bing Satellite": bingSatellite,
        "Cymraeg": welshMap
    };

    var overlayMaps = {
        "LiDAR Data": wmsLayer
    };

    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
});
