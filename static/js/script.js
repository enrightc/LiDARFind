/*jshint esversion: 6 */
/* global bootstrap, $ */
/* exported openCreateForm, closeCreateForm, openFilter, closeFilters, tooltipList */

$(document).ready(function() {

    // Function to fadeout Flash messages after 5 seconds
    setTimeout(function() {
        $(".flashes").fadeOut("slow", function() {
            $(this).alert('close');
        });
    }, 5000);

    // Get the site type and monument type select elements by their IDs
    const siteTypeSelect = $('#site_type'); // The dropdown element where the user selects a site type.
    const monumentTypeSelect = $('#monument_type'); // The dropdown element where the monument types will be populated based on the selected site type.
    const siteTypeFilterSelect = $('#site_type_filter'); // The filter dropdown element for site type.
    const monumentTypeFilterSelect = $('#monument_type_filter'); // The filter dropdown element for monument type.

    /**
     * This function dynamically updates the options available in the monument type filter dropdown 
     * based on the selected site type filter.
     */
    // Event listener listens for any change in the selected value of the site type filter dropdown
    siteTypeFilterSelect.on('change', function() {
        // Get the selected site type filter value from the site type filter dropdown
        const selectedSiteTypeFilter = siteTypeFilterSelect.val();

        /**
         * This function dynamically updates the options available in the monument type filter dropdown 
         * based on the selected site type filter by sending a POST request to the server endpoint '/get_monument_types' with the selected site type as JSON data.
         * The server processes this request and returns the relevant monument types for the selected site type. 
         * Adapted from Ian Vincent, Stack Overflow user (see references)
         * Adapted from: https://www.youtube.com/watch?v=xgwsAHeZaX0 and https://stackoverflow.com/questions/62048242/how-to-display-ajax-get-request-data-to-html 
         */
        $.ajax({
            url: '/get_monument_types',  // Endpoint to get monument types
            type: 'POST',  // HTTP method for the request
            contentType: 'application/json',  // Set the request content type to JSON
            data: JSON.stringify({ site_type: selectedSiteTypeFilter }),  // Send the selected site type as JSON
            success: function(data) {
                // Clear previous options in the monument type dropdown
                monumentTypeFilterSelect.html('<option value="" disabled selected>Monument type</option>');

                // Populate the monument type filter dropdown with new options from the server response
                // Iterates through the returned data (monument types) and appends each as a new option in the dropdown. 
                data.forEach(function(monumentTypeFilter) {
                    const newOption = $('<option></option>').val(monumentTypeFilter).text(monumentTypeFilter);
                    monumentTypeFilterSelect.append(newOption);
                });

                // Enable and re-initialise the monument type filter select element
                monumentTypeFilterSelect.prop('disabled', false);
                monumentTypeFilterSelect.formSelect();  // Re-initialise only this select
            }
        });
    });

    /**
     * This function works as above but manages the form dropdowns. 
     * When a user selects a site type in a form, it fetches the corresponding 
     * monument types and updates the monument type dropdown in the forms.
     */
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

                // Enable and re-initialise the monument type select element
                monumentTypeSelect.prop('disabled', false);
            }
        });
    });
});

/**
 * This function sets up bootstrap form validation. It ensures that forms with the class
 * 'needs-validation' are validated before submission. 
 * If a form is not valid, it prevents the form from being submitted and adds
 * the Bootstrap class 'was-validated' to indicate which fields were invalid.
 * Code provided by Bootstrap. 
 */
(() => {
    'use strict';

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over each form and prevent submission if the form is invalid
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {

            // Check if the form is valid
            if (!form.checkValidity()) {
                // Prevent form submission if invalid
                event.preventDefault();
                event.stopPropagation();
            }
            // Add the was-validated class to show validation feedback
            form.classList.add('was-validated');
        }, false);
    });
})();

// Function to open the create record form by setting its display style to "block".
function openCreateForm() {
    // Display the create form element
    document.getElementById("create-form").style.display = "block";
}

// Function to close the create record form by setting its display style to "none".
function closeCreateForm() {
    // Hide the create form element
    document.getElementById("create-form").style.display = "none";
}

// Function to open the filter section by setting its display style to "block".
function openFilter() {
    // Display the filter element
    document.getElementById("filter").style.display = "block";
}

// Function to close the filter section by setting its display style to "none".
function closeFilters() {
    // Hide the filter element
    document.getElementById("filter").style.display = "none";
}

// Event listener to initialise Bootstrap tooltips when the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the attribute data-bs-toggle="tooltip"
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    // Initialise Bootstrap tooltips on the selected elements
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
