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

- Adding Bing Satellite imageryto map:
  - [Mapping API's: Leaflet - Adding Microsoft Bing Basemap Layers](https://store.extension.iastate.edu/product/Mapping-APIs-Leaflet-Adding-Microsoft-Bing-Basemap-Layers)   [Accessed 8th June, 2024].

- Script for bing.js:
  - [leaflet-plugins](https://github.com/shramov/leaflet-plugins). Developed by Pavel Shramov. [Accessed 8th June, 2024].
