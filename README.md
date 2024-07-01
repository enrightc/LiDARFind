# BUGS
## Fixed Bugs

### Conflict Between Materialize and Leaflet Layer Controls

**Issue:** When integrating the Materialize CSS framework and Leaflet for interactive maps into the application, radio buttons for toggling base layers in the Leaflet layer control were not visible. This made it impossible for users to switch between different base map layers.

**Solution:** The root cause was identified as a CSS conflict between Materialize and Leaflet frameworks, where Materialize's default styles were interfering with Leaflet controls. Using Dev Inspector Tools, the class selector for the layer controls was identified. Custom CSS was then implemented to properly display radio buttons. Materialize CSS sets the opacity of radio buttons to "0", so this was changed to "1" to ensure the Leaflet layer controls displayed correctly.

![Custom CSS to display layer controls](readme-images/code-snippets/custom-leaflet-css.png)

**Outcome:** After applying these CSS rules, the radio buttons for base layers and checkboxes for overlay layers in the Leaflet layer control were displayed correctly and were fully functional. This solution ensured that users could interact with the map layers as intended, providing a consistent and intuitive user experience.

### MongoDB '_id' Field Cannot be Directly Used in JSON

**Issue:** When retrieving data from a MongoDB database and attempting to return it as a JSON response, an error occurred due to the presence of the _id field. The _id field in MongoDB is an ObjectId type, which cannot be directly represented in JSON.

**Solution:** To resolve the issue, the '_id' field needs to be either excluded from the retrieved data or converted to a string representation before returning it as a JSON response.

**Outcome:** By excluding the _id field the application can successfully return the retrieved data as a JSON response without encountering errors related to the ObjectId type used by MongoDB for the _id field.

### Data Fetching Issue with MongoDB Cursor

**Issue** When fetching data from MongoDB and using it multiple times within the same template, the data did not render correctly. This issue arose because the data was retrieved as a cursor, which can only be iterated over once. After the first use, the cursor was exhausted, making the data unavailable for subsequent uses within the template. This problem particularly impacted the rendering of dropdown options on the record page, where the same data was needed for both the "Create Record" form and the search filters. As a result, the data was only available for the first use, and subsequent attempts to access it resulted in no data being rendered.

**Solution** Convert the cursor to a list immediately after fetching the data. This ensures that the data is fully retrieved and can be used multiple times within the template.

![Converting Cursor to List](readme-images/code-snippets/converting-cursor-list.png)

**Outcome** The data can now be used in more than one dropdown, resolving the issue and ensuring consistent data rendering across the template.

### Prefilling Input Texts

**Issue** When dynamically entering adding coordinate data to the record form the placeholder labels were overlapping the prefilled text. 

**Solution** Call the function M.updateTextFields(); to reinitialize all the Materialize the labels on the page (source: Materailize).

![Converting Cursor to List](readme-images/code-snippets/updateTextFields-code-snippet.png)

**Outcome** When the input field is auto-populated with the coordinates the placeholder text moves in to the active state and no longer overlaps the input. 

### Navbar Pushed Page Content Down on Smaller Screens

**Issue** When the navbar is expanded on smaller screens, it pushes the page content down instead of overlaying it. This causes the layout to shift unexpectedly, affecting the user experience.

**Solution** To resolve the issue, the CSS for the navbar was updated to use position: absolute, ensuring the navbar overlays the page content instead of pushing it down. Additionally, padding was added to the body to prevent content from being hidden behind the navbar. The following CSS was added:

![CSS to prevent navbar pushing page content down](readme-images/code-snippets/navbar-css.png)

**Outcome**  By applying the position: absolute property to the navbar and adding padding-top to the body, the navbar now overlays the page content when expanded on smaller screens. This prevents the content from being pushed down and ensures it is not hidden behind the navbar, maintaining a consistent layout and improving the overall user experience.


# Resources

- For help overriding Materialize default CSS for checkboxes:
  - [Materialize css Radio buttons not visible](https://stackoverflow.com/questions/49757521/materialize-css-radio-buttons-not-visible) Stackoverflow thread created 10th April, 2018  [Accessed 8th June, 2024].

  - Materialize Prefilling Input Texts
    - [Text Inputs](https://pixinvent.com/materialize-material-design-admin-template/documentation/text-inputs.html) Materialize.  [Accessed 24th June, 2024].


- For help using leaflet map framework:
  - [Leaflet: an open-source JavaScript library for mobile-friendly interactive maps](https://leafletjs.com/)   [Accessed 8th June, 2024].

- For help retrieving cooordinates from map
  - [https://stackoverflow.com/questions/28646317/how-to-remove-all-layers-and-features-from-map](https://stackoverflow.com/questions/28646317/how-to-remove-all-layers-and-features-from-map)  Stack OverFlow, created on 21st Feb, 2015. [Accessed 9th June, 2024].

  - For map functions
    - [Simple Click Events](https://developers.google.com/maps/documentation/javascript/examples/event-simple) [Accessed 9th June, 2024].

  - For Hover popups on map
    - [Showing popup on mouse-over, not on click using Leaflet?](https://gis.stackexchange.com/questions/31951/showing-popup-on-mouse-over-not-on-click-using-leaflet) Stack OverFlow, created on 22nd August, 2012. [Accessed 10th June, 2024].

  - Reset map view to initial state
    - [Leaflet.ResetView](https://github.com/drustack/Leaflet.ResetView). [Accessed 10th June, 2024].

  [SagaCity](https://github.com/isntlee/Sagacity/blob/master/templates/home.html). [Accessed 9th June, 2024].

- Adding Bing Satellite imageryto map:
  - [Mapping API's: Leaflet - Adding Microsoft Bing Basemap Layers](https://store.extension.iastate.edu/product/Mapping-APIs-Leaflet-Adding-Microsoft-Bing-Basemap-Layers)   [Accessed 8th June, 2024].

- Script for bing.js:
  - [leaflet-plugins](https://github.com/shramov/leaflet-plugins). Developed by Pavel Shramov. [Accessed 8th June, 2024].

- For help adding an eventlisterner to dropdown menus
  - [addEventListener, "change" and option selection](https://stackoverflow.com/questions/24875414/addeventlistener-change-and-option-selection) Stackoverflow thread created 21st July, 2014  [Accessed 8th June, 2024].

  - [Dynamically Populate Second Dropdownlist from a first dropdownlist using Jquery Ajax](https://www.youtube.com/watch?v=xgwsAHeZaX0) YobTube. created 9th August, 2021  [Accessed 8th June, 2024].

  - [How to display ajax get request data to html?](https://stackoverflow.com/questions/62048242/how-to-display-ajax-get-request-data-to-html) Stackoverflow. created 27th May, 2020 by Ian vincent.  [Accessed 5th June, 2024].

- W3 Schools sidenav
  - [Open the Sidebar Navigation Over a Part of the Content](https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_sidebar_over) W3 Schools. [Accessed 19th June, 2024].