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