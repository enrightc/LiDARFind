// Initialize the map
var map = L.map('user-profile-map').setView([52.4814, -3.9797], 8);

// Base Map Layer: OpenStreetMap
var openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Bing Maps Satellite Layer (commented out)
/*
var bingSatellite = new L.BingLayer('AjH7Kmd8nydYW5bYUgAmdOD0g7hZzlMdu5tlFLvVT8oCT-n-CeUQLRutNJJXLhpY', {
    type: 'Aerial'  // Use 'AerialWithLabels' if you want satellite images with labels
});
*/

// Adding the WMS layer for LiDAR DSM (hillshade) data
var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", { // Base URL to the OWS endpoint
    layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
})

// Fetch user locations 
// Adapted from: https://github.com/isntlee/Sagacity/blob/master/templates/home.html
fetch("/fetch_user_records")
    .then(response => response.json())
    .then(data => {
        userRecords(data);
    })

function userRecords(data) {
    // Iterate through the user records and extract location data
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

        // Add click event listener to each marker
        marker.on('click', function() {
            map.setView(marker.getLatLng(), 14); // Zoom to level 14 and center on the marker
        });
    });
}
   

// Layer control to toggle between layers
var baseMaps = {
    "OpenStreetMap": openStreetMap,
    "Bing Satellite": bingSatellite
};

var overlayMaps = {
    "LiDAR Data": wmsLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);