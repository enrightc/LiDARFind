// Initialise the map with the specified initial view and zoom level (centered over Wales)
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

// Adding the WMS layer for LiDAR DSM (hillshade) data. provided by Welsh Gov on an Open Government Licence.
var wmsLayer = L.tileLayer.wms("https://datamap.gov.wales/geoserver/ows", {
    layers: 'geonode:wales_lidar_dsm_1m_hillshade_cog',
});

/**
 * Custom icons for fir different types of map markers
 * Adapted from: https://leafletjs.com/examples/custom-icons/
 */

//Crosshair marker
var crosshairIcon = L.icon({
    iconUrl: '/static/images/crosshair.svg',
    iconSize: [38, 95], // size of the icon
    iconAnchor: [19, 48], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// Logged in users map markers
var currentUserIcon = L.icon({
    iconUrl: '/static/images/current-user-marker.png',
    iconSize: [21, 36], 
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34] 
});

// Map markers of other users
var otherUserIcon = L.icon({
    iconUrl: '/static/images/other-user-marker.png',
    iconSize: [21, 36], 
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34] 
});

// Array to store markers with associated data for search filters (period, site type, monument type)
allMarkers = [];

// Fetch all records from the DB and display them on the map
fetch("/fetch_user_records")
    .then(response => response.json())
    .then(data => {
        displayRecords(data.all_records, data.current_user);
    });

// Function to display all records on the map
// data = records to be displayed
// currentUSer = The username of the logged in user
function displayRecords(data, currentUser) {
    data.forEach(record => {
        const location = record.location;  // Assuming location is a string "lat,lng"
        const [lat, lng] = location.split(',').map(parseFloat);
        const icon = record.created_by === currentUser ? currentUserIcon : otherUserIcon;
        const marker = L.marker([lat, lng], { icon }).addTo(map);

        // Create popup content for each map marker
        var popupContent = `
            <b>Title:</b> ${record.title}<br>
            <b>Site Type:</b> ${record.site_type}<br>
            <b>Monument Type:</b> ${record.monument_type}<br>
            <b>Description:</b> ${record.description}<br>
            <b>Period:</b> ${record.period}<br>
            <b>Created by:</b> ${record.created_by}<br>
            <b>Created on:</b> ${record.created_on}<br>
        `;

        // Add edit and delete button if the marker is made by the current user or current user is an admin
        if (record.created_by === currentUser || isAdmin) {
            popupContent += `
                 <div class="button-container">
                    <a href="/edit-record/${record._id}" class="btn edit-btn">Edit</a>
                    <a href="#" class="btn delete-btn" onclick="openDeleteModal('${record._id}')">Delete</a>
                </div>
            `;
        }

        marker.bindPopup(popupContent);

        // Store marker with its associated data for filtering
        window.allMarkers.push({
            marker,
            period: record.period,
            site_type: record.site_type,
            monument_type: record.monument_type
        });
    });
}

// Function to open the delete modal
// This function confirms the user wants to delete the record and then deletes it by triggering the delete_record function. 
// recordId = The unique ID of the record to be deleted
function openDeleteModal(recordId) {
    const confirmDelete = document.getElementById("confirmDeleteBtn");

    // Set the href for the confirm button to trigger the delete action
    confirmDelete.href = `/delete_record/${recordId}`;

    // Show the delete confirmation modal
    // adapted from: https://stackoverflow.com/questions/62827002/bootstrap-v5-manually-call-a-modal-mymodal-show-not-working-vanilla-javascrip
    const deleteModal = new bootstrap.Modal(document.getElementById('confirmDelete'));
    deleteModal.show();
}

/**
 * Adds event listeners to filter dropdowns and a reset button to filter 
 * and display markers based on user input.
 */
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
    document.getElementById('period-filter').selectedIndex = 0;
    document.getElementById('site_type_filter').selectedIndex = 0;
    document.getElementById('monument_type_filter').selectedIndex = 0;

    // Re-apply filters to show all markers
    applyFilters();
});

/**
 * Function to  Apply the selected filters to show or hide markers on the map
 */
function applyFilters() {
    const selectedPeriod = document.getElementById('period-filter').value;
    const selectedSiteType = document.getElementById('site_type_filter').value;
    const selectedMonumentType = document.getElementById('monument_type_filter').value;

    /**
    * Iterating over rach item in the 'allMarkers' array using .foreach method. 
    * For each item it is performing three checks:
    * 1. if the selected period mathes the item's period.
    * 2. if the selected site type mathces the item's site type.
    * 3. if the selected monument type matches the item's monument type.
    * In each case it will be true if either nothing is selected (e.g. period ==""),
    * or the item matches the selection (e.g.item.monument_type === selectedMonumentType)
    */
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

// Ensure `currentMarker` is defined
let currentMarker;

/**
 * Adds a marker on the map at the location clicked by the user and updates 
 * the input field with the coordinates. 
 */
// click event listener to the map to place a new marker when creating records
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

// Reset map view to initial state
// Credit: https://github.com/drustack/Leaflet.ResetView
L.control.resetView({
    position: "topleft",
    title: "Reset view",
    latlng: L.latLng([52.4814, -3.9797]),
    zoom: 8,
}).addTo(map);

// controls to switch between base maps and overlay maps.
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

L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map)