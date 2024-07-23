# LiDARFIND TESTING

 Back to [README.md](ReadME.md).

 LiDARFind underwent comprehensive testing to ensure functionality, user engagement, and compatibility across various platforms. Both manual and automated testing methods were employed to scrutinise every aspect of the website and has been documented here.

 # AUTOMATED TESTING
 Automated testing was undertaken using a range of open-source developer tools including Google Lighthouse Analysis, HTML, CSS and JavaScript validation. These tests assessed the quiz's quality, performance, accessibility and adherence to web standards. Any identified issues were addressed to enhance the websites usability and overall user experience.

 ## HTML

 To test the markup validity [HTML Validator](https://validator.w3.org/) was used to assess markup validity and compliance with accessibility standards. The following warning/errors were identified and addressed:

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

