// Initialize the map
var initialView = [52.4814, -3.9797];
var initialZoom = 8;
var map = L.map('mapid').setView(initialView, initialZoom);

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

// Sidebar
var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);

// Variable to store the current marker
let currentMarker;

// Fetch all records
fetch("/fetch_user_records")
    .then(response => response.json())
    .then(data => {
        displayRecords(data.all_records);
    });

function displayRecords(data) {
    // Iterate through all records and add markers to the map
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
        marker.bindPopup("Popup content");
        marker.on('mouseover', function (e) {
            this.openPopup();
        });
        marker.on('mouseout', function (e) {
            this.closePopup();
        });

        // Bind the popup to the marker
        marker.bindPopup(popupContent);

         // Add click event listener to the marker
         // Adapted from: https://leafletjs.com/reference.html
         marker.on('click', function () {
            sidebar.setContent(`
                <h2>${record.title}</h2>
                <p><b>PRN:</b> ${record.prn}</p>
                <p><b>Site Type:</b> ${record.site_type}</p>
                <p><b>Monument Type:</b> ${record.monument_type}</p>
                <p><b>Interpretation:</b> ${record.interpretation}</p>
                <p><b>Period:</b> ${record.period}</p>
                <p><b>Location:</b> ${record.location}</p>
                <p><b>Created on:</b> ${record.created_on}</p>
                <p><b>Created by:</b> ${record.created_by}</p>
            `);
            sidebar.show();
        });
    });
}

// Add click event listener to the map to place a new marker and show sidebar
map.on('click', function(e) {
    var coords = e.latlng;

    // Check if there is an existing marker and remove it
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create a new marker at the clicked coordinates
    currentMarker = L.marker(coords).addTo(map);

    // Show the sidebar and set its content
    sidebar.setContent(`
        <h2>Create a New Record</h2>
        <p>Do you want to create a record at this location?</p>
        <p>Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}</p>
        <button onclick="createRecord(${coords.lat}, ${coords.lng})">Yes</button>
        <button onclick="sidebar.hide()">No</button>
    `);
    sidebar.show();
});

// Function to handle record creation (you can define the logic here)
function createRecord(lat, lng) {
    // Implement the record creation logic here
    console.log(`Creating record at ${lat}, ${lng}`);
    sidebar.hide();
}

var baseMaps = {
    "OpenStreetMap": openStreetMap,
    /* uncomment if using 
    "Bing Satellite": bingSatellite
    */
};

var overlayMaps = {
    "LiDAR Data": wmsLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
