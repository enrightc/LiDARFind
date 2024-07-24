# LiDARFIND TESTING

 Back to [README.md](ReadME.md).

 LiDARFind underwent comprehensive testing to ensure functionality, user engagement, and compatibility across various platforms. Both manual and automated testing methods were employed to scrutinise every aspect of the website and has been documented here.

 # AUTOMATED TESTING
 Automated testing was undertaken using a range of open-source developer tools including Google Lighthouse Analysis, HTML, CSS and JavaScript validation. These tests assessed the quiz's quality, performance, accessibility and adherence to web standards. Any identified issues were addressed to enhance the websites usability and overall user experience.

 ## HTML

 To test the markup validity [HTML Validator](https://validator.w3.org/) was used to assess markup validity and compliance with accessibility standards. THe following table shows the results for each page:

### HTML Validation Test Results

#### Summary Table

| Page             | Date     | Comments                                          | Pass/Fail |
|------------------|----------|--------------------------------------------------|-----------|
| Home             | 22/07/24 | No errors or warnings                            | Pass      |
| Resources        | 22/07/24 | No errors or warnings                            | Pass      |
| Log in           | 22/07/24 | No errors or warnings                            | Pass      |
| Register         | 22/07/24 | No errors or warnings                            | Pass      |
| Profile          | 22/07/24 | No errors or warnings                            | Pass      |
| Record           | 22/07/24 | No errors or warnings                            | Pass      |
| Edit record      | 23/07/24 | No errors or warnings                            | Pass      |
| Log out          | 23/07/24 | No errors or warnings                            | Pass      |
| Admin Dashboard  | 23/07/24 | Duplicate IDs are generated in the HTML for user and record elements* | Fail      |
| Admin Dashboard  | 23/07/24 | No errors or warnings                            | Pass      |

#### * Detailed Issue Report: Admin Dashboard

- **Date:** 23/07/24
- **Issue:** Duplicate IDs are being generated in the HTML for user and record elements.
- **Description:** 
  - When rendering the Admin Dashboard page, duplicate IDs were being generated due to the use of loop indices (`{{ loop.index }}`) for ID generation within nested loops. This caused validation errors and potential conflicts in element manipulation.
- **Solution:**
  - The HTML template was updated to use unique identifiers for user and record elements, specifically `{{ user._id }}` and `{{ record._id }}`, to ensure that each element has a unique ID.
- **Status:** Issue resolved, the Admin Dashboard now passes HTML validation with no errors or warnings.

## CSS Validation

The CSS code of the website was validated using the [W3C CSS Validator](https://jigsaw.w3.org/css-validator/#validate_by_input). The validation results are as follows:

### Noted Issue

1. **Error Detected**:
   - **Property**: `font-optical-sizing`
   - **Value**: `auto`
   - **Description**: The property `font-optical-sizing` doesn't exist in CSS.

### Action Taken

The property `font-optical-sizing: auto;` was removed from the CSS to resolve the validation error.

This ensures that the CSS code is fully compliant with web standards and free of validation errors.


## JSHint

### script.js Testing Report

| Metric                                      | Value                                    |
|---------------------------------------------|------------------------------------------|
| **Total number of functions**               | 18                                       |
| **Function with the largest signature**       | 1 argument                               |
| **Median number of arguments per function** | 0                                        |
| **Largest function (statements)**           | 7 statements                             |
| **Median number of statements per function**  | 2 statements                             |
| **Most complex function (cyclomatic)**      | Cyclomatic complexity value of 2          |
| **Median cyclomatic complexity**            | 1                                        |

**Unused Variables**

The following variables were initially flagged by JSHint as unused but are actually used in the HTML for functionality:
- `tooltipList`: Used for initialising Bootstrap tooltips.
- `openCreateForm`: Used to open the create record form.
- `closeCreateForm`: Used to close the create record form.
- `openFilter`: Used to open the filter section.
- `closeFilters`: Used to close the filter section.

These were fixed by adding the `/* exported ... */` directive at the top of the JavaScript file to inform JSHint that these variables are used externally.


### lidar-map.js Testing Report

| Metric                                      | Value                                    |
|---------------------------------------------|------------------------------------------|
| **Total number of functions**               | 12                                       |
| **Function with the largest signature**     | 2 argument                               |
| **Median number of arguments per function**    | 1                                        |
| **Largest function (statements)**           | 9 statements                             |
| **Median number of statements per function**  | 2.5 statements                           |
| **Most complex function (cyclomatic)**      | Cyclomatic complexity value of 7             |
| **Median cyclomatic complexity**            | 1                                        |

**Unused Variables**

The following variables were initially flagged by JSHint as unused but are actually used in the HTML for functionality:
- `openDeleteModal`: Used for opening the confirmation delete modal

These were fixed by adding the `/* exported ... */` directive at the top of the JavaScript file to inform JSHint that these variables are used externally.

**Undefined Variable**
- **One undefined variable**: `isAdmin` on line 89.

This warning occurs because the `isAdmin` variable is declared in the HTML template and not directly within the JavaScript file. 

To manage the isAdmin variable effectively and ensure it reflects the user's actual status, I am declaring it in the HTML using server-side templating. This approach allows the backend to pass the isAdmin status dynamically based on the authenticated user's role. Here’s the declaration in the HTML:

html
Copy code
`<script>
    var isAdmin = {{ is_admin|tojson }};
</script>`

By doing this, isAdmin is available globally in our JavaScript files without the need to redeclare it, ensuring it accurately represents the user's admin status. Despite JSHint flagging isAdmin as an undefined variable in the JavaScript files, the script works as expected because the variable is defined in the HTML before any JavaScript execution.

This method ensures the isAdmin variable is dynamic and secure, reflecting the actual status of the user logged in, and avoids hardcoding it to true or false within the JavaScript code. This approach maintains the integrity of our application by ensuring that only users with the correct admin privileges can access certain functionalities.

To suppress the JSHint warning,  /* global isAdmin */  is added to the directive at the top of the JavaScript file. 

This informs JSHint that isAdmin is a globally defined variable, resolving the warning while ensuring the code remains functional and clear.

### homepage-map.js Testing Report

| Metric                                      | Value                                    |
|---------------------------------------------|------------------------------------------|
| **Total number of functions**               | 11                                       |
| **Function with the largest signature**     | 1 argument                               |
| **Median number of arguments per function**    | 1                                        |
| **Largest function (statements)**           | 6 statements                             |
| **Median number of statements per function**  | 1 statements                           |
| **Most complex function (cyclomatic)**      | Cyclomatic complexity value of 7             |
| **Median cyclomatic complexity**            | 1                                        |


**Undefined Variable**
- **One undefined variable**: `L`

This warning occurs because the `L` variable, provided by the Leaflet library, is defined globally and not within the JavaScript file itself. 

To resolve this warning `/* global L*/` is added to the directive at the top of the JavaScript file. 
This directive informs JSHint that `L` and `bootstrap` are globally defined variables, preventing the tool from flagging them as undefined. 
This ensures that the code is correctly validated without unnecessary warnings, while maintaining the functionality provided by these libraries.

### edit-page.js Testing Report

| Metric                                      | Value                                    |
|---------------------------------------------|------------------------------------------|
| **Total number of functions**               | 2                                       |
| **Function with the largest signature**     | 1 argument                               |
| **Median number of arguments per function**    | 0.5                                        |
| **Largest function (statements)**           | 11 statements                             |
| **Median number of statements per function**  | 8 statements                           |
| **Most complex function (cyclomatic)**      | Cyclomatic complexity value of 2             |
| **Median cyclomatic complexity**            | 1.5                                        |

**Undefined Variable**
- **One undefined variable**: `L`

This warning occurs because the `L` variable, provided by the Leaflet library, is defined globally and not within the JavaScript file itself. 

To resolve this warning `/* global L*/` is added to the directive at the top of the JavaScript file. 
This directive informs JSHint that `L` and `bootstrap` are globally defined variables, preventing the tool from flagging them as undefined. 
This ensures that the code is correctly validated without unnecessary warnings, while maintaining the functionality provided by these libraries.

## Lighthouse Analysis
Lighthouse in Chrome Developer Tools was used to assess the performance, accessibility, best practice and SEO rating of the website. The analysis was conducted on both mobile and desktop devices, and the scores were recorded for each page of the website. The table below illusrates the results of the analysis. 

### With Map Elements

| Page             | Performance       |                | Accessibility     |                | Best Practice     |                | SEO            |                |
|------------------|-------------------|----------------|-------------------|----------------|-------------------|----------------|----------------|----------------|
|                  | Mobile (%)        | Desktop (%)    | Mobile (%)        | Desktop (%)    | Mobile (%)        | Desktop (%)    | Mobile (%)     | Desktop (%)    |
| Home             | 45                | 90             | !                 | !              | 100               | 100            | 100            | 100            |
| Resources        | 72                | 94             | 98                | 93             | 100               | 100            | 100            | 100            |
| Log in           | 84                | 97             | 96                | 96             | 100               | 100            | 100            | 100            |
| Register         | 73                | 98             | 96                | 96             | 100               | 100            | 100            | 100            |
| Profile          | 83                | 98             | 95                | 95             | 100               | 100            | 100            | 100            |
| Record           | 73                | 90             | !                 | !              | 96                | 96             | 100            | 100            |
| Edit record      | 73                | 95             | !                 | !              | 96                | 96             | 100            | 100            |
| Log out          | 83                | 98             | 95                | 95             | 100               | 100            | 100            | 100            |
| Admin Dashboard  | 81                | 96             | 100               | 100            | 100               | 100            | 100            | 100            |

From the table above it is evidence that pages containing maps displayed significantly lower performance and accesibility scores, particularly on mobile devices. It seems plausible to suggest that the presence of the leaflet maps was contributing to the reduced scores.

To test this hypothesis a comparative analysis was carried out, this time removing the map elements from the affected pages. The results are recorded in the table below:

### Without Map

| Page             | Performance       |                | Accessibility     |                | Best Practice     |                | SEO            |                |
|------------------|-------------------|----------------|-------------------|----------------|-------------------|----------------|----------------|----------------|
|                  | Mobile (%)        | Desktop (%)    | Mobile (%)        | Desktop (%)    | Mobile (%)        | Desktop (%)    | Mobile (%)     | Desktop (%)    |
| Home             | 60                | 93             | 95                | 95             | 100               | 96             | 100            | 100            |
| Record           | 88                | 97             | 95                | 95             | 96                | 96             | 100            | 100            |
| Edit record      | 83                | 99             | 95                | 96             | 96                | 100            | 100            | 100            |

The performance scores for mobile devices show a marked improvement when the leaflet map is removed from the pages. For example, the Home page perforamnce incrases from 45% to 60% on mobile.
The difference is less pronounced for desktop performancce scores, which are generally higher with or without the map. 
The accessibility scores are not consistently reported when the map elements were present. Once removed the scores are unoformly higher. 
The best practice and SEO scores are consistently high with and without map elements, indicting they are not affected by the leaflet map. 

By running the Lighthouse analysis twice - first with the maps included and then with the maps removed - it is possible to identify that the performance and accessibility are impacted by leaflet maps. This method provided a concrete basis for understanding how dynamic, interactive elements like maps can affect web page metrics, particularly on mobile devices. The inclusion of the Leaflet map appears to introduce performance bottlenecks, particularly affecting the mobile experience. This is likely due to the additional JavaScript and rendering required to display and interact with the map. By deferring the loading of non-essential scripts and styles or optimising the map integration, it might be possible to mitigate some of these performance impacts. However, the map provides significant functionality and value to the user experience, so these trade-offs need careful consideration.

In a final effort to increase performance and accessibility of the home page, particularly on mobile devices, "Lazy Loading" using intersection Observer was implemented to defer the loading of the map element on the home page until it enters viewport.

### With Lazy Loading using Intersection Observation

| Page             | Performance       |                | Accessibility     |                | Best Practice     |                | SEO            |                |
|------------------|-------------------|----------------|-------------------|----------------|-------------------|----------------|----------------|----------------|
|                  | Mobile (%)        | Desktop (%)    | Mobile (%)        | Desktop (%)    | Mobile (%)        | Desktop (%)    | Mobile (%)     | Desktop (%)    |
| Home             | 48                | 91             | 95                | 95             | 75               | 100            | 100            | 100            |


By implementing lazy loading for the map element using the intersection observer it was possible to mitigate some of the performance and accessibility impacts. This approach defers the loading time of the map until it enters the viewport, thus reducing the intial load time. 

In hindsight, I realise that including an interactive element such as a map on the home page may not have been the best decision. For a marketing website, this could potentially lead to a significant bounce rate as the performance and accessibility impacts might deter users from staying on the page.

However, given that this website is map-oriented and heavily relies on displaying geographical data, the inclusion of a map on the home page serves an essential purpose. It aligns with the primary functionality and user expectations of the site. Therefore, under these specific circumstances, the performance trade-offs are justified and likely not to cause significant issues.

Additionally, I tested other websites that rely heavily on maps, including Google Maps and Rightmove, and observed that they also have low scores for performance. This observation suggests that the inclusion of interactive maps inherently impacts performance metrics, yet these websites still provide significant value and usability despite the lower scores

### Other Notable Observations From Lighthouse Analysis
During the Lighthouse analysis of the Home Page, several warnings were flagged in the console, indicating "Third party cookie is blocked in Chrome as part of Privacy Sandbox." These warnings appear to be related to external libraries rather than being part of my own codebase. When running Lighthouse in incognito mode, these warnings were not flagged, suggesting that these third-party cookies are blocked due to Chrome's enhanced privacy settings in regular browsing mode. 

These warnings do not direcly impact the core functionality of the website.

# MANUAL TESTING

### Feature Testing:

For each feature the expected outcomes and actual outcomes are clearly defined for each feature, making it easy to assess whether the application meets the requirements. This process makes it easier to identify and address any issues or discrepancies that may arise and also serves as a reference point for other developers to understand the expected behaviour of a feature. The results are recorded in the following tables:

### Browser Compatibility:
- Expected: Consistent appearance and functionality across major browsers.
- Testing: Test site on Chrome, Mozilla, Safari, and Edge browsers.
- Outcome: The site renders as expected with good responsiveness and compatibility across different browsers.

### Responsiveness Test:
Expected: Site should render appropriately on various devices with different screen sizes. Testing: Test responsiveness on iPhone 12, iPad 12, and desktop (1024px). Outcome: The site displays responsively across different devices, maintaining functionality and appearance as intended.

