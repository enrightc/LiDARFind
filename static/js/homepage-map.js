// Initialize the map
var initialView = [52.4814, -3.9797];
var initialZoom = 8;
var map = L.map('homePageMap').setView(initialView, initialZoom);

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

// Custom icon for current marker
var crosshairIcon = L.icon({
    iconUrl: 'static/images/crosshair.svg',
    iconSize: [38, 95], // size of the icon
    iconAnchor: [19, 48], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// Variable to store the current marker
let currentMarker;

// Array to store markers with associated data for search filters (period, site type, monument type)
let allMarkers = [];

// Fetch all records and display them on the map
fetch("/fetch_user_records")
    .then(response => response.json())
    .then(data => {
        displayRecords(data.all_records);
    });

function displayRecords(data) {
    data.forEach(record => {
        const location = record.location;  // Assuming location is a string "lat,lng"
        const [lat, lng] = location.split(',').map(parseFloat);
        const marker = L.marker([lat, lng]).addTo(map);

        // Create popup content
        var popupContent = `
            <b>Title:</b> ${record.title}<br>
            <b>Site Type:</b> ${record.site_type}<br>
            <b>Monument Type:</b> ${record.monument_type}<br>
            <b>Interpretation:</b> ${record.interpretation}<br>
            <b>Period:</b> ${record.period}<br>
        `;

        marker.bindPopup(popupContent);
        // Store marker with its associated data
        allMarkers.push({
            marker,
            period: record.period,
            site_type: record.site_type,
            monument_type: record.monument_type
        });

    });
}

// Functions for filtering and displaying map markers based on user search parameters
// Event Listeners for dropdown Filters
document.getElementById('period-filter').addEventListener('change', function () {
    applyFilters();
});
document.getElementById('site_type_filter').addEventListener('change', function () {
    applyFilters();
});
document.getElementById('monument_type_filter').addEventListener('change', function () {
    applyFilters();
});

document.getElementById('reset-filters-btn').addEventListener('click', function () {
    // Reset the filter dropdowns to their default values
    // Reset the filter dropdowns to their default values
    document.getElementById('period-filter').selectedIndex = 0;
    document.getElementById('site_type_filter').selectedIndex = 0;
    document.getElementById('monument_type_filter').selectedIndex = 0;

    // Re-apply filters to show all markers
    applyFilters();
});

// Function to apply filters and display markers accordingly on the map
function applyFilters() {
    const selectedPeriod = document.getElementById('period-filter').value;
    const selectedSiteType = document.getElementById('site_type_filter').value;
    const selectedMonumentType = document.getElementById('monument_type_filter').value;

    allMarkers.forEach(item => {
        let matchesPeriod = selectedPeriod === "" || item.period === selectedPeriod;
        let matchesSiteType = selectedSiteType === "" || item.site_type === selectedSiteType;
        let matchesMonumentType = selectedMonumentType === "" || item.monument_type === selectedMonumentType;

        if (matchesPeriod && matchesSiteType && matchesMonumentType) {
            map.addLayer(item.marker); // Show marker
        } else {
            map.removeLayer(item.marker); // Hide marker
        }
    });
}

// Add click event listener to the map to place a new marker and show sidebar
map.on('click', function (e) {
    var coords = e.latlng;

    // Check if there is an existing marker and remove it
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Update the input field with the coordinates
    document.getElementById('location').value = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    

    // Make the location input field readonly after it has been filled
    document.getElementById('location').classList.add('readonly');
    
    // Create a new marker at the clicked coordinates
    currentMarker = L.marker(coords, {icon: crosshairIcon}).addTo(map);
});

// Base Maps
var baseMaps = {
    "OpenStreetMap": openStreetMap,
    /* uncomment if using 
    "Bing Satellite": bingSatellite
    */
};

// Overlay Maps
var overlayMaps = {
    "LiDAR Data": wmsLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);