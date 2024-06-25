$(document).ready(function() {
    // Initialize the side navigation and all select elements using Materialize
    $('.sidenav').sidenav();
    $('select').formSelect();

    // Get the site type and monument type select elements by their IDs
    const siteTypeSelect = $('#site_type');
    const monumentTypeSelect = $('#monument_type');

    const siteTypeFilterSelect = $('#site_type_filter');
    const monumentTypeFilterSelect = $('#monument_type_filter');

// Add an event listener to the site type filter select element to detect changes
siteTypeFilterSelect.on('change', function() {
    // Get the selected site type filter value
    const selectedSiteTypeFilter = siteTypeFilterSelect.val();

    // Fetch the monument types for the selected site type from the server
    // Adapted from Ian Vincent, Stack Overflow user (see references)
    $.ajax({
        url: '/get_monument_types',  // Endpoint to get monument types
        type: 'POST',  // HTTP method for the request
        contentType: 'application/json',  // Set the request content type to JSON
        data: JSON.stringify({ site_type: selectedSiteTypeFilter }),  // Send the selected site type as JSON
        success: function(data) {
            // Clear previous options in the monument type dropdown
            monumentTypeFilterSelect.html('<option value="" disabled selected>Monument type</option>');

            // Populate the monument type filter dropdown with new options from the server response
            data.forEach(function(monumentTypeFilter) {
                const newOption = $('<option></option>').val(monumentTypeFilter).text(monumentTypeFilter);
                monumentTypeFilterSelect.append(newOption);
            });

            // Enable and re-initialize the monument type filter select element
            monumentTypeFilterSelect.prop('disabled', false);
            monumentTypeFilterSelect.formSelect();  // Re-initialize only this select
        }
    });
});

    // Add an event listener to the site type select element to detect changes
    siteTypeSelect.on('change', function() {
        // Get the selected site type value
        const selectedSiteType = siteTypeSelect.val();

        // Fetch the monument types for the selected site type from the server
        // Adapted from Ian Vincent, Stack Overflow user (see references)
        $.ajax({
            url: '/get_monument_types',  // Endpoint to get monument types
            type: 'POST',  // HTTP method for the request
            contentType: 'application/json',  // Set the request content type to JSON
            data: JSON.stringify({ site_type: selectedSiteType }),  // Send the selected site type as JSON
            success: function(data) {
                // Clear previous options in the monument type dropdown
                monumentTypeSelect.html('<option value="" disabled selected>Select monument type</option>');

                // Populate the monument type dropdown with new options from the server response
                data.forEach(function(monumentType) {
                    const newOption = $('<option></option>').val(monumentType).text(monumentType);
                    monumentTypeSelect.append(newOption);
                });

                // Enable and re-initialize the monument type select element
                monumentTypeSelect.prop('disabled', false);
                $('select').formSelect();
            }
        });
    });
});

// Adapted from W3 Schools sidebar: https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_sidebar_shift
function w3_open() {
    document.getElementById("main").style.marginLeft = "25%";
    document.getElementById("mySidebar").style.width = "25%";
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("openNav").style.display = 'none';
    // Adjust for mobile
    if (window.innerWidth <= 600) {
        document.getElementById("main").style.marginLeft = "50%";
        document.getElementById("mySidebar").style.width = "50%";
    }
  }
  
  function w3_close() {
    document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
  }


