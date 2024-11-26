const fs = require('fs');

const array = ["123,456,789", "234,567,890", "345,678,901"];
console.log(array);

//format to csv using string concatenation
// const arrayQuotes = array.map(num => '"' + num + '"');
// console.log(arrayQuotes);

//format to csv using template literals
const csvArray = array.map(num => `"${num}"`).join("\n");
console.log(csvArray);

fs.writeFile("output.csv", csvArray, "utf8", (err) => {
    if (err) {
        console.error("Error writing CSV file:", err);
        return;
    }
        console.log("CSV file has been saved as titles.csv");
});