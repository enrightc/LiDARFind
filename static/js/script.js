$( document ).ready(function(){
    // Initialize the side navigation and all select elements using Materialize
    $('.sidenav').sidenav();
    $('select').formSelect();
    

// Get the site type and monument type select elements by their IDs
const siteTypeSelect = $('#site_type');
const monumentTypeSelect = $('#monument_type');

// Add an event listener to the site type select element to detect changes
siteTypeSelect.on('change', function() {
    // Get the selected site type value
    const selectedSiteType = siteTypeSelect.val();

    // Fetch the monument types for the selected site type from the server
    // Adapted from Ian Vincent, stack overflow user (see references)
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