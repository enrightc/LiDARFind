var map = L.map('mapid').setView([52.4814, -3.9797], 8);

// Adding the WMS layer for LiDAR DSM (hillshade) data
var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", { // Base URL to the OWS endpoint
layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
}).addTo(map);

/*
// Base Map Layer: OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
*/

 // Marker at Swansea
 var marker = L.marker([51.62144, -3.943645]).addTo(map);
 marker.bindPopup("<b>Hello Swansea!</b>").openPopup();

// Function to show location map clicked
function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

map.on('click', onMapClick);