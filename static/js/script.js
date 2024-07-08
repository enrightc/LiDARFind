$(document).ready(function() {

  // Function to fadeout Flash messages
  setTimeout(function() {
      $(".flashes").fadeOut("slow", function() {
          $(this).alert('close');
      });
  }, 5000);

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
          }
      });
  });
});

// Function for bootstrap form validation
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {

          if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
          }

          form.classList.add('was-validated')
      }, false)
  })
})()

// Opens and closes the create record form by setting its display style to "block".
function openCreateForm() {
  document.getElementById("create-form").style.display = "block";
}

function closeCreateForm() {
  document.getElementById("create-form").style.display = "none";
}

// Opens and closes the filters by setting its display style to "block".
function openFilter() {
  document.getElementById("filter").style.display = "block";
}

function closeFilters() {
  document.getElementById("filter").style.display = "none";
}


document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
