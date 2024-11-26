//peenr

const axios = require("axios"); //import axios library for making HTTP requests
const cheerio = require("cheerio"); //import cheerio library for parsing HTML
const fs = require('fs');

const fetchTitles = async () => { //define async function
 try {
  const response = await
  axios.get('https://www.reddit.com/r/badminton/'); //try reaching linked URL

  const html = response.data; //set html equal to the response object data property
  // console.log(html);

  fs.writeFile("output.html", html, "utf8", (err) => {
    if (err) {
      console.error("Error writing HTML file:", err);
      return;
    }
    console.log("HTML file has been saved as output.html");
  });  

  const $ = cheerio.load(html); //cheerio parses html from above request, allowing us to use cheerio functions ($)
  //jQuery syntax ($)

  const titles = []; //setup blank array which will later contain html titles

  //$ select all <a> elements inside <p> tags with the class .title inside <div> tags
  //.each() iterates over all elements matched by the selector
  //_idx index is the position of the current element, el element is the actual DOM node, similar to .map() syntax
  //$(el).text() wraps the raw el HTML element back into a Cheerio object, allowing you to use .text() method, extracting text content from the selected element
  //push extracted title .text element of a elements into the blank array
  $('#t3_1gnuk55 > a.absolute.inset-0').each((_idx, el) => { 
   const title = $(el).text()
   titles.push(title)
  });

  return titles;
 } catch (error) {
  // throw error;
  console.log('Error fetching titles:');
 }
};



fetchTitles().then((titles) => console.log(titles));

//JSDOM simulates a browser-like environment in Node.js, useful here for generating a downloadable file link.
// const { JSDOM } = require('jsdom');



// Create a new JSDOM instance
// const dom = new JSDOM();

// You can access the `document` object through the `window` object
// const document = dom.window.document;

fetchTitles().then((titles) => {
  if (!titles || titles.length === 0) {
    console.log("No titles found or fetchTitles() returned undefined.");
    return;
  }

  var csv = titles.join("\n");

  // fs.writeFileSync('/projects/web-scraper/output.html', html);

   // Use fs.writeFile to save the CSV file to your filesystem
  //  fs.writeFile("titles.csv", csv, "utf8", (err) => {
  //   if (err) {
  //     console.error("Error writing CSV file:", err);
  //     return;
  //   }
  //   console.log("CSV file has been saved as titles.csv");
  // });

  // console.log(csv);
  // var a = document.createElement('a');
  // a.href = 'data:attachment/csv,' + csv;
  // a.target = '_blank';
  // a.download = 'titles.csv';
  
  // document.body.appendChild(a);
  // a.click();
  });
