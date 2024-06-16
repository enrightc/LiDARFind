// Initialize the map with initial view and zoom level
var initialView = [52.4814, -3.9797];
var initialZoom = 8;
var map = L.map('user-profile-map').setView(initialView, initialZoom);

// Base Map Layer: OpenStreetMap
var openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Bing Maps Satellite Layer 
// Uncomment the following lines to add Bing Maps Satellite Layer
/*
var bingSatellite = new L.BingLayer('AjH7Kmd8nydYW5bYUgAmdOD0g7hZzlMdu5tlFLvVT8oCT-n-CeUQLRutNJJXLhpY', {
    type: 'Aerial'  // Use 'AerialWithLabels' if you want satellite images with labels
});
*/

// Adding the WMS layer for LiDAR DSM (hillshade) data
var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", {
    layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
});

// Fetch locations for user's records
// Adapted from: https://github.com/isntlee/Sagacity/blob/master/templates/home.html
fetch("/fetch_user_records")
    .then(response => response.json())
    .then(data => {
        userRecords(data);
    });

/**
 * Function to process user records and add markers to the map
 */
function userRecords(data) {
    data.forEach(record => {
        const location = record.location;  // Assuming location is a string "lat,lng"
        const [lat, lng] = location.split(',').map(parseFloat);
        const marker = L.marker([lat, lng]).addTo(map);

        // Create popup content
        var popupContent = `
            <b>Title:</b> ${record.title}<br>
            <b>Period:</b> ${record.period}<br>
            <b>Monument Type:</b> ${record.monument_type}
        `;

        // Credit: https://gis.stackexchange.com/questions/31951/showing-popup-on-mouse-over-not-on-click-using-leaflet
        marker.bindPopup(popupContent);
        marker.on('mouseover', function (e) {
            this.openPopup();
        });
        marker.on('mouseout', function (e) {
            this.closePopup();
        });

        // Add click event listener to each marker to display record details
        marker.on('click', function () {
            map.setView(marker.getLatLng(), 14);  // Zoom to level 14 and center on the marker
            displayRecordDetails(record);
        });
    });
}

/**
 * Function to display record details in the site details display box
 */
function displayRecordDetails(record) {
    $('#record-title').text(record.title);
    $('#record-period').text(record.period);
    $('#record-monument-type').text(record.monument_type);
    $('#record-site-type').text(record.site_type);
    $('#record-interpretation').text(record.interpretation);
    $('#record-created-on').text(record.created_on);
    $('#record-prn').text(record.prn);

    // Set the href for the edit button
    $('.edit-button').attr('href', `/edit_record/${record._id}`);

    // Set the href for the delete button
    $('.delete-button').attr('href', `/delete_record/${record._id}`);

    // Show the site details display box and hide the instruction
    $('.hidden').removeClass('hidden');
    $('.hide-on-click').addClass('hide');
}

// Reset map view to initial state
// Credit: https://github.com/drustack/Leaflet.ResetView
L.control.resetView({
    position: "topleft",
    title: "Reset view",
    latlng: L.latLng([52.4814, -3.9797]),
    zoom: 8,
}).addTo(map);

// Add event listener to reset the map view from site details display box
$('#reset-map-view').on('click', function () {
    map.setView(initialView, initialZoom);
});

// Layer control to toggle between layers
var baseMaps = {
    "OpenStreetMap": openStreetMap,
    // Uncomment the following line to add Bing Satellite layer to the layer control
    // "Bing Satellite": bingSatellite
};

var overlayMaps = {
    "LiDAR Data": wmsLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
