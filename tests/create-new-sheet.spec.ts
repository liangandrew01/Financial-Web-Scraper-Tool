// Import the Google APIs library
import { google } from 'googleapis';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

//based on month of lastSheetTitle, get the date for the newSheet to be passed to every other test so they know the correct date range to extract transactions
export async function createNewSheet(sheets, spreadsheetId) {
    const spreadsheetObject = await sheets.spreadsheets.get({ //get whole spreadsheet object
        spreadsheetId: spreadsheetId,
    });
    const sheetsArray = spreadsheetObject.data.sheets; //extract array of sub sheets
    const sheetsArrayLength = sheetsArray.length;
    const lastSheetIndex = sheetsArrayLength - 1; //get last index in sub sheets array
    const lastSheetTitle = sheetsArray[lastSheetIndex].properties.title; //extract title of last sheet
    const lastSheetId = sheetsArray[lastSheetIndex].properties.sheetId;

    const previousSheetIndex = sheetsArrayLength - 2;
    const previousSheetTitle = sheetsArray[previousSheetIndex].properties.title;
    const previousSheetId = sheetsArray[previousSheetIndex].properties.sheetId; //extract title of last sheet
    // console.log("Last sheet title: " + lastSheetTitle);

  
    //get new MONTH, not create new sheet
    async function createNewSheetTitle() {
        let latestMonth = lastSheetTitle.slice(0, 3);
        let latestYearString = lastSheetTitle.slice(3);
        let latestYear = Number(latestYearString);

        const monthsArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const lastMonthIndex = monthsArray.indexOf(latestMonth);

        if (lastMonthIndex < 11) {
            const currentMonthIndex = lastMonthIndex + 1;
            let fullYear = latestYear + 2000;
            const currentMonthString = monthsArray[currentMonthIndex];
            const currentYearString = String(latestYear);
            const newSheetTitle = currentMonthString + currentYearString;
            // console.log("New sheet title: " + newSheetTitle);
            return [newSheetTitle, currentMonthIndex, fullYear];
        } else {
            const currentMonthIndex = 0;
            latestYear += 1;
            let fullYear = latestYear + 2000;
            const currentMonthString = monthsArray[currentMonthIndex];
            const currentYearString = String(latestYear);
            const newSheetTitle = currentMonthString + currentYearString;
            // console.log("New sheet title: " + newSheetTitle);
            return [newSheetTitle, currentMonthIndex, fullYear];
        }
    };
    const [newSheetTitle, currentMonthIndex, fullYear] = await createNewSheetTitle();
    // console.log([newSheetTitle, currentMonthIndex, fullYear]);
 
    // Copy previous month as template
    
    console.log("New sheet title: " + newSheetTitle);

    const newMonthSheet = await sheets.spreadsheets.sheets.copyTo({
        spreadsheetId: spreadsheetId,
        sheetId: sheetsArray[lastSheetIndex].properties.sheetId,
        resource: {
            destinationSpreadsheetId: spreadsheetId,
        }
    });

    async function updateSheetTitle(spreadsheetId, newSheetTitle) {
        try {
          const request = {
            spreadsheetId: spreadsheetId,
            resource: { // aka "requestBody" which says "for this method, here is the data or edits I want to apply to the resource (the spreadsheet or a specific part of it)""
              requests: [
                {
                  updateSheetProperties: {
                    properties: {
                        sheetId: newMonthSheet.data.sheetId,
                        title: newSheetTitle,
                    },
                    fields: "title",
                  },
                },
              ],
            },
          };
      
          const response = await sheets.spreadsheets.batchUpdate(request);
        } catch (error) {
          console.error('Error creating new sheet:', error);
        }
    }

    // Example usage
    await updateSheetTitle(spreadsheetId, newSheetTitle);

    const newMonthDate = newSheetTitle.slice(0, 3) + String(fullYear);
    // Append the extracted transaction data to the Google Sheet
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { // this is the "request body"
          valueInputOption: 'USER_ENTERED', // Write data as raw input (no formatting)
          data: [
            {
              range: `${newSheetTitle}!A1`, // Insert date into A1
              values: [[newMonthDate],],
            },
            {
              range: `${newSheetTitle}!A8:A16`, // clear personally paid items column
              values: Array(9).fill([""]),
            },
            {
              range: `${newSheetTitle}!H2:H6`, 
              values: Array(5).fill([""])
            },
            {
              range: `${newSheetTitle}!H8:I16`, 
              values: Array(9).fill(["", ""])
            },
            {
              range: `${newSheetTitle}!B21:G22`, // clear deposited thru venmo and personally paid items row
              values: Array(2).fill(Array(6).fill("")),
            },
            {
              range: `${newSheetTitle}!A6`, // enter $69 for maintenance and repairs
              values: [["Maintenance and Repairs"]],
            },
            {
              range: `${newSheetTitle}!H6`, // enter $69 for maintenance and repairs
              values: [["69"]],
            },
          ]
        },
    });

    // await sheets.spreadsheets.values.clear({
    //   spreadsheetId,
    //   range: `${newSheetTitle}!H2:H6`, // Replace with your target range
    // });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newMonthSheet.data.sheetId, // Replace with actual sheet ID
                startRowIndex: 1, // H2:H16
                endRowIndex: 17, 
                startColumnIndex: 7,
                endColumnIndex: 8,
              },
              cell: {
                // userEnteredValue: null, // Clears the cell value
                note: "", // Clears any notes
              },
              fields: "note",
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: newMonthSheet.data.sheetId, // Replace with actual sheet ID
                startRowIndex: 20, // B21:G21
                endRowIndex: 21, 
                startColumnIndex: 1,
                endColumnIndex: 7,
              },
              cell: {
                // userEnteredValue: null, // Clears the cell value
                note: "", // Clears any notes
              },
              fields: "note",
            },
          },
        ],
      },
    });

    const lastMonthBalanceCellsArray = ["B20", "C20", "D20", "E20", "F20", "G20"];
    const lastMonthBalanceReferenceCellsArray = ["B23", "C23", "D23", "E23", "F23", "G23"];
    async function updateLastMonthBalanceCellFormula(cell, previousSheetTitle, lastMonthReferenceCell) {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
              valueInputOption: 'USER_ENTERED', // Write data as raw input (no formatting)
              data: [
                {
                  range: `${newSheetTitle}!${cell}`, // clear personally paid items column
                  values: [[`='${previousSheetTitle}'!${lastMonthReferenceCell}`]],
                },
              ]
            },
        });
    }
    for (var i = 0; i < lastMonthBalanceCellsArray.length; i++) {
        await updateLastMonthBalanceCellFormula(lastMonthBalanceCellsArray[i], lastSheetTitle, lastMonthBalanceReferenceCellsArray[i])
    }

    // // update monthly average formula
    // // get previous month 'MMM24'!G19
    // async function createNewFormulaSegment() {
    //     const newFormulaSegment = `'${previousSheetTitle}'!G19`;
    //     // console.log(newFormulaSegment);
    //     return newFormulaSegment;
    // };
    // const newFormulaSegment = await createNewFormulaSegment();

    // async function getLastAverageCellFormula() {
    //     const oldAverageFormula = await sheets.spreadsheets.values.get({
    //         spreadsheetId, //already defined, so don't need spreadsheetId: spreadsheetId like above
    //         range: `${lastSheetTitle}!K19`, //range must be a string
    //         valueRenderOption: "FORMULA",
    //     })
    //     // console.log(oldAverageFormula.data.values); // an array of arrays [ ["value"] ]
    //     return oldAverageFormula.data.values[0][0]; // extract just the "value"
    // };
    // let oldAverageFormula = await getLastAverageCellFormula();

    // async function createAverageCellFormula() {
    //     const newAverageFormula1 = oldAverageFormula.replace(/=SUM\(G19/, `=SUM(G19+${newFormulaSegment}`);
    //     // console.log(newAverageFormula1); 
    //     const numberOfMonthsRegex = oldAverageFormula.match(/\/(\d+)/);
    //     const numberOfMonths = Number(numberOfMonthsRegex[1]);
    //     const newNumberOfMonths = numberOfMonths + 1;
    //     const newNumberOfMonthsString = String(newNumberOfMonths);
    //     // console.log(newNumberOfMonthsString);
    //     const newAverageFormula2 = newAverageFormula1.replace(/\/(\d+)/, `/${newNumberOfMonthsString}`);
    //     // console.log(newAverageFormula2);
    //     return newAverageFormula2;
    // };
    // const newAverageFormula = await createAverageCellFormula();

    // async function updateAverageCellFormula() {
    //     await sheets.spreadsheets.values.batchUpdate({
    //         spreadsheetId,
    //         resource: {
    //             valueInputOption: 'USER_ENTERED',
    //             data: [
    //                 {
    //                     range: `${lastSheetTitle}!K19`,
    //                     values: [
    //                         [newAverageFormula]
    //                     ]
    //                 }
    //             ],
    //         }
    //     });
    // };
    // await updateAverageCellFormula();
  };

// test('createNewSheet', async () => {
//     await createNewSheet();
// });
