const { chromium } = require('@playwright/test') // Import the Playwright Chromium browser package for web automation
const fs = require('fs'); // Import the Node.js File System module to enable file reading/writing

// Use an immediately invoked function expression (IIFE) for async code execution
(async () => {
   const browser = await chromium.launch() // Launch a new Chromium browser instance
   const page = await browser.newPage() // Open a new page (tab) in the browser
   
   await page.goto('https://finance.yahoo.com/quote/CVS/balance-sheet/?p=CVS', {timeout: 100000}); // Navigate to the specified URL
   await page.waitForSelector('div.column.yf-t22klz', {timeout: 100000});   // Wait up to 30 seconds for the specified element to appear in the DOM
   const element = await page.locator('div.column.yf-t22klz').allTextContents();  // Find all elements matching the specified class and get their text contents as an array
   // console.log(element);// Output the array of text content to the console for verification

   const element2 = element.map(num => "" + num + "");
   console.log(element2);
   const csvContent = element2.join();// Prepare the text content array for CSV format by adding quotes and newlines for each entry
   console.log(csvContent);

   // const data = { title }; // Store the text content array in an object to save as JSON format

   // fs.writeFileSync('output.json', JSON.stringify(data)); // Write the JSON data to 'output.json' in the current directory
 
   // Uncomment the following line to save the CSV data to 'output.csv' instead
   // fs.writeFileSync('output.csv', csvcontent, "utf8");

   // fs.writeFile("output.csv", csvContent, "utf8", (err) => {
   //      if (err) {
   //        console.error("Error writing CSV file:", err);
   //        return;
   //      }
   //      console.log("CSV file has been saved as titles.csv");
   //    });

   await browser.close(); // Close the browser to free up resources
})();
