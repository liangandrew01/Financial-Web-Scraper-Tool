// Import the Google APIs library
import { google } from 'googleapis';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

//based on month of lastSheetTitle, get the date for the newSheet to be passed to every other test so they know the correct date range to extract transactions
export async function updateMonthlyAverage(sheets, spreadsheetId, newSheetTitle) {
    const spreadsheetObject = await sheets.spreadsheets.get({ //get whole spreadsheet object
        spreadsheetId: spreadsheetId,
    });
    const sheetsArray = spreadsheetObject.data.sheets; //extract array of sub sheets
    const sheetsArrayLength = sheetsArray.length;
    const lastSheetIndex = sheetsArrayLength - 1; //get last index in sub sheets array
    const lastSheetTitle = sheetsArray[lastSheetIndex].properties.title; //extract title of last sheet
    const lastSheetId = sheetsArray[lastSheetIndex].properties.sheetId; //extract title of last sheet
    
    //'Oct24'
    const previousSheetIndex = sheetsArrayLength - 2; //get last index in sub sheets array
    const previousSheetTitle = sheetsArray[previousSheetIndex].properties.title; //extract title of last sheet
    const previousSheetId = sheetsArray[previousSheetIndex].properties.sheetId; //extract title of last sheet
    
    //get previous month 'Oct24'!G19
    async function createNewFormulaSegment() {
        const newFormulaSegment = `'${previousSheetTitle}'!G19`;
        // console.log(newFormulaSegment);
        return newFormulaSegment;
    };
    const newFormulaSegment = await createNewFormulaSegment();

    async function getLastAverageCellFormula() {
        const oldAverageFormula = await sheets.spreadsheets.values.get({
            spreadsheetId, //already defined, so don't need spreadsheetId: spreadsheetId like above
            range: `${lastSheetTitle}!K19`, //range must be a string
            valueRenderOption: "FORMULA",
        })
        // console.log(oldAverageFormula.data.values); // an array of arrays [ ["value"] ]
        return oldAverageFormula.data.values[0][0]; // extract just the "value"
    };
    let oldAverageFormula = await getLastAverageCellFormula();

    async function createAverageCellFormula() {
        const newAverageFormula1 = oldAverageFormula.replace(/=SUM\(G19/, `=SUM(G19+${newFormulaSegment}`);
        // console.log(newAverageFormula1); 
        const numberOfMonthsRegex = oldAverageFormula.match(/\/(\d+)/);
        const numberOfMonths = Number(numberOfMonthsRegex[1]);
        const newNumberOfMonths = numberOfMonths + 1;
        const newNumberOfMonthsString = String(newNumberOfMonths);
        // console.log(newNumberOfMonthsString);
        const newAverageFormula2 = newAverageFormula1.replace(/\/(\d+)/, `/${newNumberOfMonthsString}`);
        // console.log(newAverageFormula2);
        return newAverageFormula2;
    };
    const newAverageFormula = await createAverageCellFormula();

    async function updateAverageCellFormula() {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: [
                    {
                        range: `${lastSheetTitle}!K19`,
                        values: [
                            [newAverageFormula]
                        ]
                    }
                ],
            }
        });
    };
    await updateAverageCellFormula();

    // async function updatePersonallyPaidCellFormula(cellFormula) {
    //     await sheets.spreadsheets.values.batchUpdate({
    //         spreadsheetId,
    //         resource: {
    //           valueInputOption: 'USER_ENTERED', // Write data as raw input (no formatting)
    //           data: [
    //             {
    //               range: `${newSheetTitle}!G19`, // G19 clear personally paid items column
    //               values: [[`=${cellFormula}`]],
    //             },
    //           ]
    //         },
    //     });
    // } 

    // await updatePersonallyPaidCellFormula();
  };





// test('createNewSheet', async () => {
//     await createNewSheet();
// });
