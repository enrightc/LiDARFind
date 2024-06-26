document.addEventListener("DOMContentLoaded", function() {
    // Get the existing location from the record
    const recordLocation = document.getElementById('location').value;
    const [lat, lng] = recordLocation.split(',').map(parseFloat);

    // Initialize the map centered on the record location
    var map = L.map('edit-record-map').setView([lat, lng], 14);

    // Base Map Layer: OpenStreetMap
    var openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Bing Maps Satellite Layer
    /*
    var bingSatellite = new L.BingLayer('AjH7Kmd8nydYW5bYUgAmdOD0g7hZzlMdu5tlFLvVT8oCT-n-CeUQLRutNJJXLhpY', {
        type: 'Aerial'  // Use 'AerialWithLabels' if you want satellite images with labels
    });
    */

    // Adding the WMS layer for LiDAR DSM (hillshade) data
    var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", {
        layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
    });

    var crosshairIcon = L.icon({
        iconUrl: 'static/images/crosshair.svg',
        iconSize:     [38, 95], // size of the icon
        iconAnchor:   [19, 48], // point of the icon which will correspond to marker's location
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
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
        // Uncomment the following line if using Bing Satellite
        // "Bing Satellite": bingSatellite
    };

    var overlayMaps = {
        "LiDAR Data": wmsLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);
});
