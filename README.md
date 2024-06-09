# BUGS
## Fixed Bugs

### Conflict Between Materialize and Leaflet Layer Controls

**Issue:** When integrating the Materialize CSS framework and Leaflet for interactive maps into the application, radio buttons for toggling base layers in the Leaflet layer control were not visible. This made it impossible for users to switch between different base map layers.

**Solution:** The root cause was identified as a CSS conflict between Materialize and Leaflet frameworks, where Materialize's default styles were interfering with Leaflet controls. Using Dev Inspector Tools, the class selector for the layer controls was identified. Custom CSS was then implemented to properly display radio buttons. Materialize CSS sets the opacity of radio buttons to "0", so this was changed to "1" to ensure the Leaflet layer controls displayed correctly.

![Custom CSS to display layer controls](readme-images/code-snippets/custom-leaflet-css.png)

**Outcome:** After applying these CSS rules, the radio buttons for base layers and checkboxes for overlay layers in the Leaflet layer control were displayed correctly and were fully functional. This solution ensured that users could interact with the map layers as intended, providing a consistent and intuitive user experience.

# Resources

- For help overriding Materialize default CSS for checkboxes:
  - [Materialize css Radio buttons not visible](https://stackoverflow.com/questions/49757521/materialize-css-radio-buttons-not-visible) Stackoverflow thread created 10th April, 2018  [Accessed 8th June, 2024].

- For help using leaflet map framework:
  - [Leaflet: an open-source JavaScript library for mobile-friendly interactive maps](https://leafletjs.com/)   [Accessed 8th June, 2024].

- For help retrieving cooordinates from map
  - [https://stackoverflow.com/questions/28646317/how-to-remove-all-layers-and-features-from-map](https://stackoverflow.com/questions/28646317/how-to-remove-all-layers-and-features-from-map)  Stack OverFlow, created on 21st Feb, 2015. [Accessed 9th June, 2024].

  - For map functions
    - [Simple Click Events](https://developers.google.com/maps/documentation/javascript/examples/event-simple) [Accessed 9th June, 2024].

- Adding Bing Satellite imageryto map:
  - [Mapping API's: Leaflet - Adding Microsoft Bing Basemap Layers](https://store.extension.iastate.edu/product/Mapping-APIs-Leaflet-Adding-Microsoft-Bing-Basemap-Layers)   [Accessed 8th June, 2024].

- Script for bing.js:
  - [leaflet-plugins](https://github.com/shramov/leaflet-plugins). Developed by Pavel Shramov. [Accessed 8th June, 2024].

- For help adding an eventlisterner to dropdown menus
  - [addEventListener, "change" and option selection](https://stackoverflow.com/questions/24875414/addeventlistener-change-and-option-selection) Stackoverflow thread created 21st July, 2014  [Accessed 8th June, 2024].

  - [Dynamically Populate Second Dropdownlist from a first dropdownlist using Jquery Ajax](https://www.youtube.com/watch?v=xgwsAHeZaX0) YobTube. created 9th August, 2021  [Accessed 8th June, 2024].

   - [How to display ajax get request data to html?](https://stackoverflow.com/questions/62048242/how-to-display-ajax-get-request-data-to-html) Stackoverflow. created 27th May, 2020 by Ian vincent.  [Accessed 5th June, 2024].
